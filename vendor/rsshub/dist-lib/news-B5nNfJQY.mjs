import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/rustcc/news.ts
const baseUrl = "https://rustcc.cn";
const route = {
	path: "/news",
	categories: ["programming"],
	example: "/rustcc/news",
	radar: [{ source: ["rustcc.cn/"] }],
	name: "新闻/聚合",
	maintainers: ["zhenlohuang"],
	handler,
	url: "rustcc.cn/"
};
async function handler() {
	const newsUrl = "https://rustcc.cn/section?id=f4703117-7e6b-4caf-aa22-a3ad3db6898f";
	return {
		title: "Rust语言中文社区 | 新闻/聚合",
		link: newsUrl,
		description: "获取Rust语言中文社区的新闻/聚合",
		item: load((await got_default({
			url: newsUrl,
			headers: { Referer: baseUrl }
		})).data)(".article-list li").toArray().map((item) => getFeedItem(item))
	};
}
function getFeedItem(item) {
	const $ = load(item);
	const title = $(".title");
	return {
		title: title.text(),
		link: `${baseUrl}${title.attr("href")}`,
		description: $(".info .tags").text(),
		pubDate: timezone(parseDate($(".info .timestamp").text(), "YYYY-MM-DD hh:mm"), 8)
	};
}
//#endregion
export { route };
