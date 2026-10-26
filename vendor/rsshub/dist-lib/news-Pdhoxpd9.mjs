import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/moj/aac/news.ts
const baseUrl = "https://www.aac.moj.gov.tw";
const route = {
	path: "/aac/news/:type?",
	categories: ["government"],
	example: "/gov/moj/aac/news",
	parameters: { type: "資料大類，留空為全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新消息",
	maintainers: ["TonyRL"],
	handler,
	description: `| 全部 | 其他 | 採購公告 | 新聞稿 | 肅貪 | 預防 | 綜合 | 防疫專區 |
| ---- | ---- | -------- | ------ | ---- | ---- | ---- | -------- |
|      | 02   | 01       | 06     | 05   | 04   | 03   | 99       |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const url = `${baseUrl}/7204/7246/?Page=1&PageSize=40${type ? `&type=${type}` : ""}`;
	const $ = load((await got_default(url)).data);
	$(".num").remove();
	const list = $(".list ul li a").toArray().map((item) => {
		item = $(item);
		const isDownload = /檔案下載/.test(item.attr("title"));
		return {
			title: isDownload ? item.text().trim() : item.attr("title"),
			link: new URL(item.attr("href"), baseUrl).href,
			isDownload
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (!item.isDownload) {
			const $ = load((await got_default(item.link)).data);
			item.pubDate = timezone(parseDate($(".info time").attr("datetime"), "YYYY-MM-DD HH:mm:ss"), 8);
			$(".info, button").remove();
			item.description = $(".cp").html() + ($(".lightbox_slider").length ? $(".lightbox_slider").html() : "") + ($(".file_download").length ? $(".file_download").html() : "");
		}
		delete item.isDownload;
		return item;
	})));
	return {
		title: $("head title").text(),
		link: url,
		item: items,
		language: "zh-TW"
	};
}
//#endregion
export { route };
