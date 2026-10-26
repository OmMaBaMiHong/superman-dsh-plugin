import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { i as parseDuration } from "./helpers-5QIj7EjI.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { n as getVideoUrl, r as utils_default } from "./utils-BLUZ3MUn.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/video.ts
const route = {
	path: "/user/video/:uid/:embed?",
	categories: ["social-media"],
	view: 3,
	example: "/bilibili/user/video/2267573",
	parameters: {
		uid: "用户 id, 可在 UP 主主页中找到",
		embed: "默认为开启内嵌视频, 任意值为关闭"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["space.bilibili.com/:uid"],
		target: "/user/video/:uid"
	}],
	name: "UP 主投稿",
	maintainers: [
		"DIYgod",
		"Konano",
		"pseudoyu"
	],
	handler
};
const videoListApiPath = "/x/space/wbi/arc/search";
const allowedBrowserRequestTypes = /* @__PURE__ */ new Set([
	"document",
	"script",
	"xhr",
	"fetch",
	"image",
	"font",
	"stylesheet",
	"other"
]);
const browserResponseTimeout = 45e3;
const browserCloseTimeout = 9e4;
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
const isVideoListApiResponse = (response) => {
	const request = response.request();
	return response.url().includes(videoListApiPath) && request.method() === "GET" && (request.resourceType() === "xhr" || request.resourceType() === "fetch");
};
const waitForVideoListResponse = async (page) => {
	try {
		return { response: await page.waitForResponse(isVideoListApiResponse, { timeout: browserResponseTimeout }) };
	} catch (error) {
		return { error };
	}
};
const navigateToVideoPage = async (page, videoUrl) => {
	try {
		await page.goto(videoUrl, {
			timeout: browserResponseTimeout,
			waitUntil: "domcontentloaded"
		});
	} catch (error) {
		logger.warn(`[bilibili/video] video page navigation did not finish before the response wait ended: ${getErrorMessage(error)}`);
	}
};
const getVideoListResponse = async (responsePromise) => {
	const videoListResponseResult = await responsePromise;
	if ("error" in videoListResponseResult) throw new Error(`Bilibili browser mode did not receive a video list response within ${browserResponseTimeout}ms: ${getErrorMessage(videoListResponseResult.error)}`);
	return videoListResponseResult.response;
};
const waitForVideoListResponseFromVideoPage = async (page, videoUrl) => {
	const videoListResponsePromise = waitForVideoListResponse(page);
	await navigateToVideoPage(page, videoUrl);
	const response = await getVideoListResponse(videoListResponsePromise);
	if (response.status() !== 200) throw new Error(`Bilibili browser mode returned unexpected video list API status ${response.status()}`);
	if (!response.headers()["content-type"]?.includes("application/json")) throw new Error(`Bilibili browser mode returned non-JSON response with status ${response.status()}; BILIBILI_COOKIE_* may be required`);
	return response;
};
async function applyCookie(page, cookie) {
	const cookies = cookie.split(";").map((item) => item.trim()).filter(Boolean).map((item) => {
		const equalIndex = item.indexOf("=");
		if (equalIndex <= 0) return;
		return {
			name: item.slice(0, equalIndex).trim(),
			value: item.slice(equalIndex + 1).trim(),
			domain: ".bilibili.com",
			path: "/"
		};
	}).filter((item) => item !== void 0);
	if (cookies.length > 0) await page.context().addCookies(cookies);
}
async function fetchVideoListFromApi(uid) {
	const cookie = await cache_default.getCookie();
	const wbiVerifyString = await cache_default.getWbiVerifyString();
	const dmImgList = utils_default.getDmImgList();
	const dmImgInter = utils_default.getDmImgInter();
	const renderData = await cache_default.getRenderData(uid);
	const params = utils_default.addWbiVerifyInfo(utils_default.addRenderData(utils_default.addDmVerifyInfoWithInter(`mid=${uid}&ps=30&tid=0&pn=1&keyword=&order=pubdate&platform=web&web_location=1550101&order_avoided=true`, dmImgList, dmImgInter), renderData), wbiVerifyString);
	const data = (await got_default(`https://api.bilibili.com${videoListApiPath}?${params}`, { headers: {
		Referer: `https://space.bilibili.com/${uid}`,
		origin: "https://space.bilibili.com",
		Cookie: cookie
	} })).data;
	if (data.code) {
		logger.error(JSON.stringify(data.data));
		throw new Error(`Got error code ${data.code} while fetching: ${data.message}`);
	}
	return data.data;
}
async function fetchVideoListFromBrowser(uid) {
	const cookie = cache_default.getConfiguredCookie();
	const videoUrl = `https://space.bilibili.com/${uid}/video`;
	logger.info(`[bilibili/video] fetching via playwright: ${videoUrl}`);
	const { destroy, page } = await getPlaywrightPage(videoUrl, {
		closeTimeout: browserCloseTimeout,
		noGoto: true,
		onBeforeLoad: async (page) => {
			if (cookie) await applyCookie(page, cookie);
			await page.route("**/*", (route) => {
				const request = route.request();
				allowedBrowserRequestTypes.has(request.resourceType()) ? route.continue() : route.abort();
			});
		},
		gotoConfig: { waitUntil: "domcontentloaded" }
	});
	try {
		const data = await (await waitForVideoListResponseFromVideoPage(page, videoUrl)).json();
		if (data.code) {
			logger.error(JSON.stringify(data.data));
			throw new Error(`Got error code ${data.code} while fetching in browser mode: ${data.message}`);
		}
		if (!data.data) throw new Error("Bilibili browser response does not contain video list data");
		return data.data;
	} finally {
		await destroy();
	}
}
async function getVideoList(uid) {
	try {
		return await fetchVideoListFromApi(uid);
	} catch (error) {
		logger.warn(`[bilibili/video] API request failed, falling back to browser mode: ${error}`);
		return fetchVideoListFromBrowser(uid);
	}
}
async function handler(ctx) {
	const isJsonFeed = ctx.req.query("format") === "json";
	const uid = ctx.req.param("uid");
	const embed = !ctx.req.param("embed");
	const videos = (await getVideoList(uid)).list?.vlist ?? [];
	let name = videos[0]?.author || uid;
	let face;
	try {
		const usernameAndFace = await cache_default.getUsernameAndFaceFromUID(uid);
		name = usernameAndFace[0] || name;
		face = usernameAndFace[1];
	} catch (error) {
		logger.warn(`[bilibili/video] failed to fetch user profile: ${error}`);
	}
	return {
		title: `${name} 的 bilibili 空间`,
		link: `https://space.bilibili.com/${uid}`,
		description: `${name} 的 bilibili 空间`,
		image: face ?? void 0,
		logo: face ?? void 0,
		icon: face ?? void 0,
		item: await Promise.all(videos.map(async (item) => {
			const subtitles = isJsonFeed && !config.bilibili.excludeSubtitles && item.bvid ? await cache_default.getVideoSubtitleAttachment(item.bvid) : [];
			return {
				title: item.title,
				description: utils_default.renderUGCDescription(embed, item.pic, item.description, item.aid, void 0, item.bvid),
				pubDate: (/* @__PURE__ */ new Date(item.created * 1e3)).toUTCString(),
				link: item.created > utils_default.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
				author: name,
				comments: item.comment,
				attachments: item.bvid ? [{
					url: getVideoUrl(item.bvid),
					mime_type: "text/html",
					duration_in_seconds: parseDuration(item.length)
				}, ...subtitles] : void 0
			};
		}))
	};
}
//#endregion
export { route };
