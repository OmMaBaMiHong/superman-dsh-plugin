import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/bfl/announcements.ts
const ROOT_URL = "https://bfl.ai";
/**
* 辅助函数：获取并解析单个公告详情页，提取正文内容，并使用缓存。
*/
const fetchDescription = (item) => cache_default.tryGet(item.link, async () => {
	const fullDescription = load(await rofetch(item.link, {}))("div.max-w-3xl.mx-auto.px-6").html()?.trim();
	return {
		...item,
		description: fullDescription || item.description
	};
});
/**
* 主路由处理函数
*/
async function handler() {
	const listPageUrl = `${ROOT_URL}/announcements`;
	const $ = load(await rofetch(listPageUrl));
	const feedTitle = $("head title").text().trim() || "BFL AI Announcements";
	const feedDescription = $("head meta[name=\"description\"]").attr("content")?.trim() || "Latest announcements from Black Forest Labs (bfl.ai).";
	const preliminaryItems = $("div.flex.flex-col.max-w-3xl.mx-auto.space-y-8 > a[href^=\"/announcements/\"]").toArray().map((anchorElement) => {
		const $anchor = $(anchorElement);
		const relativeLink = $anchor.attr("href");
		const link = relativeLink ? `${ROOT_URL}${relativeLink}` : void 0;
		const title = $anchor.find("h2[class*=\"text-xl\"]").text().trim();
		const $timeElement = $anchor.find("time");
		const datetimeAttr = $timeElement.attr("datetime");
		const timeText = $timeElement.text().trim();
		const pubDate = datetimeAttr ? parseDate(datetimeAttr) : timeText ? parseDate(timeText) : void 0;
		const summaryDescription = $anchor.find("p[class*=\"line-clamp-3\"]").html()?.trim() || "";
		const author = "Black Forest Labs";
		if (!title || !link) return null;
		const preliminaryItem = {
			title,
			link,
			description: summaryDescription,
			author
		};
		if (pubDate) preliminaryItem.pubDate = pubDate.toUTCString();
		return preliminaryItem;
	}).filter((item) => item !== null && item.link !== void 0);
	return {
		title: feedTitle,
		link: listPageUrl,
		description: feedDescription,
		item: await Promise.all(preliminaryItems.map((item) => fetchDescription(item))),
		language: "en"
	};
}
/**
* 定义并导出RSSHub路由对象
*/
const route = {
	path: "/announcements",
	categories: ["multimedia"],
	example: "/bfl/announcements",
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
		source: ["bfl.ai/announcements"],
		target: "/announcements",
		title: "Announcements"
	}],
	name: "Announcements",
	maintainers: ["thirteenkai"],
	handler,
	url: "bfl.ai/announcements",
	description: "Fetches the latest announcements from Black Forest Labs (bfl.ai). Provides full article content by default with caching."
};
//#endregion
export { route };
