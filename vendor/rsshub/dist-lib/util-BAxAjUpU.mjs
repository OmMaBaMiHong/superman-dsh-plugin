import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright, t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { t as CaptchaError } from "./captcha-BP6deQBe.mjs";
import { load } from "cheerio";
//#region lib/routes/xiaohongshu/util.ts
const getHeaders = (cookie) => ({
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
	"Accept-Encoding": "gzip, deflate, br",
	"Accept-Language": "en-US,en;q=0.9",
	"Cache-Control": "no-cache",
	Connection: "keep-alive",
	Host: "www.xiaohongshu.com",
	Pragma: "no-cache",
	"Sec-Ch-Ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
	"Sec-Ch-Ua-Mobile": "?0",
	"Sec-Ch-Ua-Platform": "\"Windows\"",
	"Sec-Fetch-Dest": "document",
	"Sec-Fetch-Mode": "navigate",
	"Sec-Fetch-Site": "none",
	"Sec-Fetch-User": "?1",
	"Upgrade-Insecure-Requests": "1",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
	...cookie && { Cookie: cookie }
});
async function fetchWithProxy(url, cookie) {
	const proxy = config.xiaohongshu.proxy;
	if (proxy) {
		const proxyUrl = `${proxy}?url=${encodeURIComponent(url)}`;
		logger.http(`Requesting ${url} via proxy`);
		return await rofetch(proxyUrl, { parseResponse: (txt) => txt });
	}
	logger.http(`Requesting ${url}`);
	return await rofetch(url, { headers: getHeaders(cookie) });
}
const getUser = (url, cache) => cache.tryGet(url, async () => {
	if (config.xiaohongshu.proxy) {
		const script = extractInitialState(load(await fetchWithProxy(url)));
		let { userPageData, notes } = JSON.parse(script).user;
		userPageData = userPageData._rawValue || userPageData;
		notes = notes._rawValue || notes;
		return {
			userPageData,
			notes,
			collect: ""
		};
	}
	const { page, destroy } = await getPlaywrightPage(url, { onBeforeLoad: async (page) => {
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "xhr" || request.resourceType() === "other" ? route.continue() : route.abort();
		});
	} });
	try {
		let collect = "";
		logger.http(`Requesting ${url}`);
		await page.goto(url, { waitUntil: "domcontentloaded" });
		await page.waitForSelector("div.reds-tab-item:nth-child(2), #red-captcha");
		if (await page.$("#red-captcha")) throw new CaptchaError("小红书风控校验，请稍后再试");
		const initialState = await page.evaluate(() => window.__INITIAL_STATE__);
		if (!await page.$(".lock-icon")) {
			await page.click("div.reds-tab-item:nth-child(2)");
			try {
				collect = await (await page.waitForResponse((res) => {
					const req = res.request();
					return req.url().includes("/api/sns/web/v2/note/collect/page") && req.method() === "GET" && req.resourceType() === "xhr";
				}, { timeout: 5e3 })).json();
			} catch {}
		}
		let { userPageData, notes } = initialState.user;
		userPageData = userPageData._rawValue || userPageData;
		notes = notes._rawValue || notes;
		return {
			userPageData,
			notes,
			collect
		};
	} finally {
		await destroy();
	}
}, config.cache.routeExpire, false);
const getBoard = (url, cache) => cache.tryGet(url, async () => {
	if (config.xiaohongshu.proxy) {
		const script = extractInitialSsrState(load(await fetchWithProxy(url)));
		return JSON.parse(script).Main;
	}
	const context = await outPlaywright();
	try {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "xhr" ? route.continue() : route.abort();
		});
		logger.http(`Requesting ${url}`);
		await page.goto(url);
		await page.waitForSelector(".pc-container");
		return (await page.evaluate(() => window.__INITIAL_SSR_STATE__)).Main;
	} finally {
		await context.close();
	}
}, config.cache.routeExpire, false);
async function renderNotesFulltext(notes, urlPrex, displayLivePhoto) {
	const data = [];
	const promises = notes.flatMap((note) => note.map(async ({ noteCard, id }) => {
		const link = `${urlPrex}/${id}`;
		const guid = `${urlPrex}/${noteCard.noteId}`;
		const { title, description, pubDate, updated } = await getFullNote(link, displayLivePhoto);
		return {
			title,
			link,
			description,
			author: noteCard.user.nickName,
			guid,
			pubDate,
			updated
		};
	}));
	data.push(...await Promise.all(promises));
	return data;
}
async function getFullNote(link, displayLivePhoto) {
	return await cache_default.tryGet(link, async () => {
		const script = extractInitialState(load(await fetchWithProxy(link, config.xiaohongshu.cookie)));
		const state = JSON.parse(script);
		const note = state.note.noteDetailMap[state.note.firstNoteId].note;
		const title = note.title;
		let desc = note.desc;
		desc = desc.replaceAll(/\[.*?\]/g, "");
		desc = desc.replaceAll(/#(.*?)#/g, "#$1");
		desc = desc.replaceAll("\n", "<br>");
		const pubDate = parseDate(note.time, "x");
		const updated = parseDate(note.lastUpdateTime, "x");
		let mediaContent = "";
		if (note.type === "video") {
			const originVideoKey = note.video?.consumer?.originVideoKey;
			const videoUrls = [];
			if (originVideoKey) videoUrls.push(`http://sns-video-al.xhscdn.com/${originVideoKey}`);
			for (const type of [
				"av1",
				"h264",
				"h265",
				"h266"
			]) {
				const streams = note.video?.media?.stream?.[type];
				if (streams?.length > 0) {
					const stream = streams[0];
					if (stream.masterUrl) videoUrls.push(stream.masterUrl);
					if (stream.backupUrls?.length) videoUrls.push(...stream.backupUrls);
				}
			}
			const posterUrl = note.imageList?.[0]?.urlDefault;
			if (videoUrls.length > 0) mediaContent = `<video controls ${posterUrl ? `poster="${posterUrl}"` : ""}>
                    ${videoUrls.map((url) => `<source src="${url}" type="video/mp4">`).join("\n")}
                </video><br>`;
		} else mediaContent = note.imageList.map((image) => {
			if (image.livePhoto && displayLivePhoto) {
				const videoUrls = [];
				for (const type of [
					"av1",
					"h264",
					"h265",
					"h266"
				]) {
					const streams = image.stream?.[type];
					if (streams?.length > 0) {
						if (streams[0].masterUrl) videoUrls.push(streams[0].masterUrl);
						if (streams[0].backupUrls?.length) videoUrls.push(...streams[0].backupUrls);
					}
				}
				if (videoUrls.length > 0) return `<video controls poster="${image.urlDefault}">
                            ${videoUrls.map((url) => `<source src="${url}" type="video/mp4">`).join("\n")}
                        </video>`;
			}
			return `<img src="${image.urlDefault}">`;
		}).join("<br>");
		const description = `${mediaContent}<br>${desc}`;
		return {
			title: title || note.desc,
			description,
			pubDate,
			updated
		};
	});
}
async function getUserWithCookie(url) {
	const cookie = config.xiaohongshu.cookie;
	const $ = load(await fetchWithProxy(url, cookie));
	const paths = $("#userPostedFeeds > section > div > a.cover.ld.mask").map((i, item) => item.attributes[3].value);
	const script = extractInitialState($);
	const state = JSON.parse(script);
	let index = 0;
	for (const item of state.user.notes.flat()) {
		const path = paths[index];
		if (path && path.includes("?")) item.id += path?.slice(path.indexOf("?"));
		index += 1;
	}
	return state.user;
}
function extractInitialState($) {
	let script = $("script").filter((i, script) => {
		return (script.children[0]?.data)?.startsWith("window.__INITIAL_STATE__=");
	}).text();
	script = script.slice(25);
	script = script.replaceAll("undefined", "null");
	return script;
}
function extractInitialSsrState($) {
	let script = $("script").filter((i, script) => {
		return (script.children[0]?.data)?.includes("window.__INITIAL_SSR_STATE__=");
	}).text();
	const match = script.match(/window\.__INITIAL_SSR_STATE__\s*=\s*(\{[\s\S]*?\})\s*(?:;|$)/);
	if (match) return match[1].replaceAll("undefined", "null");
	const startIndex = script.indexOf("window.__INITIAL_SSR_STATE__=");
	if (startIndex !== -1) {
		script = script.slice(startIndex + 29);
		script = script.replaceAll("undefined", "null");
		return script;
	}
	throw new Error("Cannot extract __INITIAL_SSR_STATE__");
}
async function checkCookie() {
	const cookie = config.xiaohongshu.cookie;
	const res = await rofetch("https://edith.xiaohongshu.com/api/sns/web/v2/user/me", { headers: getHeaders(cookie) });
	return res.code === 0 && !!res.data.user_id;
}
//#endregion
export { renderNotesFulltext as a, getUserWithCookie as i, getBoard as n, getUser as r, checkCookie as t };
