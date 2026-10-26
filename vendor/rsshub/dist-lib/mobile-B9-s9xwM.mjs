import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/sohu/mobile.ts
const route = {
	path: "/mobile",
	categories: ["new-media"],
	example: "/sohu/mobile",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["m.sohu.com/limit"],
		target: "/mobile"
	}],
	name: "首页新闻",
	maintainers: ["asqwe1"],
	handler,
	description: "订阅手机搜狐网的首页新闻"
};
async function handler() {
	const response = await rofetch("https://m.sohu.com/limit");
	const jsonMatch = cheerio.load(response)("script:contains(\"WapHomeRenderData\")").text()?.match(/window\.WapHomeRenderData\s*=\s*(\{.*\})/s);
	if (!jsonMatch?.[1]) throw new Error("WapHomeRenderData 数据未找到");
	const list = extractPlateBlockNewsLists(JSON.parse(jsonMatch[1])).filter((item) => item.id && item.url?.startsWith("//")).map((item) => ({
		title: item.title,
		link: new URL(item.url.split("?", 1)[0], "https://m.sohu.com").href
	}));
	return {
		title: "手机搜狐新闻",
		link: "https://m.sohu.com/limit",
		item: (await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			try {
				const detailResp = await rofetch(item.link);
				const $d = cheerio.load(detailResp);
				let description = "";
				let pubDate = "";
				if (item.link.includes("/xtopic/")) {
					const fullArticleUrl = $d(".tpl-top-text-item-content").prop("href")?.split("?", 1)[0]?.replace("www.sohu.com/", "m.sohu.com/");
					const response = await rofetch(`https:${fullArticleUrl}`);
					const $ = cheerio.load(response);
					description = getDescription($);
					pubDate = extractPubDate($);
				}
				return {
					...item,
					description: description || getDescription($d) || item.title,
					pubDate: pubDate || extractPubDate($d)
				};
			} catch (error) {
				logger.error(`获取详情失败: ${item.link}`, error);
				return item;
			}
		})))).filter(Boolean)
	};
}
function extractPlateBlockNewsLists(jsonData) {
	const result = [];
	for (const [key, plateBlock] of Object.entries(jsonData)) {
		if (!key.startsWith("PlateBlock")) continue;
		if (plateBlock?.param?.newsData?.list) result.push(...plateBlock.param.newsData.list);
		if (plateBlock?.param?.focusData?.list) result.push(...plateBlock.param.focusData.list);
		if (plateBlock?.param?.feedData0?.list) result.push(...plateBlock.param.feedData0.list);
		if (plateBlock?.param?.feedData1?.list) result.push(...plateBlock.param.feedData1.list);
	}
	return result;
}
function extractPubDate($) {
	const timeElements = [".time", "#videoPublicTime"];
	let date;
	for (const selector of timeElements) {
		const text = $(selector).first().text().trim();
		if (!text) continue;
		date = parseDate(text);
		if (date) return date;
	}
	const img = $("meta[name=\"share_img\"]").toArray().map((i) => $(i).attr("src")).find((i) => i.includes("images01"));
	date = img ? parseDate(img?.match(/images01\/(\d{8})\//i)?.[1]) : "";
	if (date) return date;
}
function getDescription($) {
	const content = $("#articleContent");
	if (content.length) return content.first().html()?.trim();
	const video = $("#videoPlayer div");
	if (video.length) return `<video controls preload="auto" poster="${video.attr("data-thumbnail")}"><source src="${video.attr("data-url")}" /></video>`;
	const imageList = $("script:contains(\"imageList\")").text();
	if (imageList) return JSON.parse(imageList.match(/(\[.*\])/s)?.[1].replaceAll(/("description": ".*"),/g, "$1") || "[]").map((item) => `<img src="${item.url}" alt="${item.description || ""}" />`).join("");
	return "";
}
//#endregion
export { route };
