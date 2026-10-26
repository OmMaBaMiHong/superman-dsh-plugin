import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as cache_default$1 } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { r as utils_default } from "./utils-BLUZ3MUn.mjs";
import { RateLimiterMemory, RateLimiterQueue } from "rate-limiter-flexible";
import { load } from "cheerio";
import { JSDOM } from "jsdom";
//#region lib/routes/bilibili/cache.ts
const subtitleLimiterQueue = new RateLimiterQueue(new RateLimiterMemory({
	points: 5,
	duration: 1,
	execEvenly: true
}), { maxQueueSize: 4800 });
const getConfiguredCookie = () => {
	if (Object.keys(config.bilibili.cookies).length === 0) return;
	for (const key of Object.keys(config.bilibili.cookies)) {
		const cookie = config.bilibili.cookies[key];
		if (cookie) {
			const updatedCookie = cookie.replace(/b_lsid=[0-9A-F]+_[0-9A-F]+/, () => `b_lsid=${utils_default.lsid()}`);
			config.bilibili.cookies[key] = updatedCookie;
		}
	}
	return config.bilibili.cookies[Object.keys(config.bilibili.cookies)[Math.floor(Math.random() * Object.keys(config.bilibili.cookies).length)]] || "";
};
const getCookie = (disableConfig = false) => {
	const configuredCookie = disableConfig ? void 0 : getConfiguredCookie();
	if (configuredCookie !== void 0) return configuredCookie;
	return cache_default$1.tryGet("bili-cookie", async () => {
		let waitForRequest = new Promise((resolve) => {
			resolve("");
		});
		const { destroy } = await getPlaywrightPage("https://space.bilibili.com/1/dynamic", { onBeforeLoad: (page) => {
			waitForRequest = new Promise((resolve) => {
				page.on("requestfinished", async (request) => {
					if (request.url() !== "https://api.bilibili.com/x/web-interface/nav") return;
					let cookieString = (await page.context().cookies()).map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
					cookieString = cookieString.replace(/b_lsid=[0-9A-F]+_[0-9A-F]+/, () => `b_lsid=${utils_default.lsid()}`);
					resolve(cookieString);
				});
			});
		} });
		const cookieString = await waitForRequest;
		logger.debug(`Got bilibili cookie: ${cookieString}`);
		await destroy();
		return cookieString;
	});
};
const getRenderData = (uid) => {
	return cache_default$1.tryGet("bili-web-render-data", async () => {
		const cookie = await getCookie();
		const { data: response } = await got_default(`https://space.bilibili.com/${uid}`, { headers: {
			Referer: "https://www.bilibili.com/",
			Cookie: cookie
		} });
		const scriptElement = new JSDOM(response).window.document.querySelector("#__RENDER_DATA__");
		const innerText = scriptElement ? scriptElement.textContent || "{}" : "{}";
		return JSON.parse(decodeURIComponent(innerText)).access_id;
	});
};
const getWbiVerifyString = () => {
	return cache_default$1.tryGet("bili-wbi-verify-string", async () => {
		const { data: navResponse } = await got_default("https://api.bilibili.com/x/web-interface/nav", { headers: {
			Referer: "https://www.bilibili.com/",
			Cookie: await getCookie()
		} });
		const imgUrl = navResponse.data.wbi_img.img_url;
		const subUrl = navResponse.data.wbi_img.sub_url;
		const r = imgUrl.slice(imgUrl.lastIndexOf("/") + 1).split(".", 1)[0] + subUrl.slice(subUrl.lastIndexOf("/") + 1).split(".", 1)[0];
		const { body: jsResponse } = await got_default("https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js", { headers: { Referer: "https://space.bilibili.com/1" } });
		const array = JSON.parse(jsResponse.match(/\[(?:\d+,){63}\d+\]/));
		const o = [];
		for (const t of array) if (r.charAt(t)) o.push(r.charAt(t));
		return o.join("").slice(0, 32);
	});
};
const getUsernameFromUID = (uid) => {
	const key = "bili-username-from-uid-" + uid;
	return cache_default$1.tryGet(key, async () => {
		const cookie = await getCookie();
		const wbiVerifyString = await getWbiVerifyString();
		const { data: nameResponse } = await got_default(`https://api.bilibili.com/x/space/wbi/acc/info?${utils_default.addWbiVerifyInfo(`mid=${uid}&token=&platform=web&web_location=1550101`, wbiVerifyString)}`, { headers: {
			Referer: `https://space.bilibili.com/${uid}/`,
			Cookie: cookie
		} });
		return nameResponse.data ? nameResponse.data.name : void 0;
	});
};
const getUsernameAndFaceFromUID = async (uid) => {
	const nameKey = "bili-username-from-uid-" + uid;
	const faceKey = "bili-userface-from-uid-" + uid;
	let name = await cache_default$1.get(nameKey);
	let face = await cache_default$1.get(faceKey);
	if (!name || !face) {
		const cookie = await getCookie();
		const wbiVerifyString = await getWbiVerifyString();
		const dmImgList = utils_default.getDmImgList();
		const renderData = await getRenderData(uid);
		const { data: nameResponse } = await got_default(`https://api.bilibili.com/x/space/wbi/acc/info?${utils_default.addWbiVerifyInfo(utils_default.addRenderData(utils_default.addDmVerifyInfo(`mid=${uid}&token=&platform=web&web_location=1550101`, dmImgList), renderData), wbiVerifyString)}`, { headers: {
			Referer: `https://space.bilibili.com/${uid}/`,
			Cookie: cookie
		} });
		if (nameResponse.data.name) {
			name = nameResponse.data.name;
			face = nameResponse.data.face;
			cache_default$1.set(nameKey, nameResponse.data.name);
			cache_default$1.set(faceKey, nameResponse.data.face);
		} else logger.error(`Error when visiting /x/space/wbi/acc/info: ${JSON.stringify(nameResponse)}`);
	}
	return [name, face];
};
const getLiveIDFromShortID = (shortID) => {
	const key = `bili-liveID-from-shortID-${shortID}`;
	return cache_default$1.tryGet(key, async () => {
		const { data: liveIDResponse } = await got_default(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${shortID}`, { headers: { Referer: `https://live.bilibili.com/${shortID}` } });
		return liveIDResponse.data.room_id;
	});
};
const getUserInfoFromLiveID = (liveID) => {
	const key = `bili-userinfo-from-liveID-${liveID}`;
	return cache_default$1.tryGet(key, async () => {
		const { data: nameResponse } = await got_default(`https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${liveID}`, { headers: { Referer: `https://live.bilibili.com/${liveID}` } });
		return nameResponse.data.info;
	});
};
const getVideoNameFromId = (aid, bvid) => {
	const key = `bili-videoname-from-id-${bvid || aid}`;
	return cache_default$1.tryGet(key, async () => {
		const { data } = await got_default("https://api.bilibili.com/x/web-interface/view", {
			searchParams: {
				aid: aid || void 0,
				bvid: bvid || void 0
			},
			referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`
		});
		return data.data.title;
	});
};
const getCidFromId = (aid, pid, bvid) => {
	const key = `bili-cid-from-id-${bvid || aid}-${pid}`;
	return cache_default$1.tryGet(key, async () => {
		const { data } = await got_default(`https://api.bilibili.com/x/web-interface/view?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`, { referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}` });
		return data?.data?.pages[pid - 1]?.cid;
	});
};
function secondsToSrtTime(seconds) {
	const date = /* @__PURE__ */ new Date(seconds * 1e3);
	return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")},${String(date.getUTCMilliseconds()).padStart(3, "0")}`;
}
function convertJsonToSrt(body) {
	return body.map((item, index) => {
		const start = secondsToSrtTime(item.from);
		const end = secondsToSrtTime(item.to);
		return `${index + 1}\n${start} --> ${end}\n${item.content}\n`;
	}).join("\n");
}
const getVideoSubtitle = async (bvid) => {
	if (!bvid) return [];
	const cid = await getCidFromId(void 0, 1, bvid);
	if (!cid) return [];
	return cache_default$1.tryGet(`bili-video-subtitle-${bvid}`, async () => {
		await subtitleLimiterQueue.removeTokens(1);
		const getSubtitleData = async (cookie) => {
			return await got_default(`https://api.bilibili.com/x/player/wbi/v2?bvid=${bvid}&cid=${cid}`, { headers: {
				Referer: `https://www.bilibili.com/video/${bvid}`,
				Cookie: cookie
			} });
		};
		const subtitles = (await getSubtitleData(await getCookie()))?.data?.data?.subtitle?.subtitles || [];
		return await Promise.all(subtitles.map(async (subtitle) => {
			const url = `https:${subtitle.subtitle_url}`;
			return {
				content: await cache_default$1.tryGet(url, async () => {
					return convertJsonToSrt((await got_default(url))?.data?.body || []);
				}),
				lan_doc: subtitle.lan_doc
			};
		}));
	});
};
const getVideoSubtitleAttachment = async (bvid) => {
	return (await getVideoSubtitle(bvid)).map((subtitle) => ({
		url: `data:text/plain;charset=utf-8,${encodeURIComponent(subtitle.content)}`,
		mime_type: "text/srt",
		title: `字幕 - ${subtitle.lan_doc}`
	}));
};
const getAidFromBvid = async (bvid) => {
	const key = `bili-cid-from-bvid-${bvid}`;
	let aid = await cache_default$1.get(key);
	if (!aid) {
		const response = await got_default(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, { headers: { Referer: `https://www.bilibili.com/video/${bvid}` } });
		if (response.data && response.data.data && response.data.data.aid) aid = response.data.data.aid;
		cache_default$1.set(key, aid);
	}
	return aid;
};
const getArticleDataFromCvid = async (cvid, uid) => {
	const url = `https://www.bilibili.com/read/cv${cvid}/`;
	const $ = load(await cache_default$1.tryGet(url, async () => (await got_default({
		method: "get",
		url,
		headers: { Referer: `https://space.bilibili.com/${uid}/` }
	})).data));
	let description = $("#read-article-holder").html();
	if (!description) try {
		const newFormatData = JSON.parse($("script:contains(\"window.__INITIAL_STATE__\")").text().match(/window\.__INITIAL_STATE__\s*=\s*(\S.*?)?;\(/)[1]);
		if (newFormatData?.readInfo?.opus?.content?.paragraphs) {
			description = "";
			for (const element of newFormatData.readInfo.opus.content.paragraphs) if (element.para_type === 1) {
				for (const text of element.text.nodes) if (text?.word?.words) description += `<p>${text.word.words}</p>`;
			} else if (element.para_type === 2) for (const image of element.pic.pics) description += `<p ><img src="${image.url}@progressive.webp"></p>`;
			else if (element.para_type === 3 && element.line?.pic?.url) description += `<figure><img src="${element.line.pic.url}"></figure>`;
		}
	} catch {}
	return {
		url,
		description
	};
};
var cache_default = {
	getCookie,
	getConfiguredCookie,
	getWbiVerifyString,
	getUsernameFromUID,
	getUsernameAndFaceFromUID,
	getLiveIDFromShortID,
	getUserInfoFromLiveID,
	getVideoNameFromId,
	getCidFromId,
	getAidFromBvid,
	getArticleDataFromCvid,
	getRenderData,
	getVideoSubtitle,
	getVideoSubtitleAttachment
};
//#endregion
export { cache_default as t };
