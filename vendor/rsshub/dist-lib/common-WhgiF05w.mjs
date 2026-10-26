import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/onehu/common.ts
const route = {
	path: "/",
	name: "Unknown",
	maintainers: ["ruoshui9527"],
	handler
};
async function handler() {
	const link = "https://onehu.xyz";
	const data = (await got_default(link)).data;
	const $ = load(data);
	const list = $("#board article").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".index-header").text(),
			link: item.find(".index-header").children("a").attr("href"),
			description: item.find(".index-excerpt.index-excerpt__noimg").children("div").text(),
			pubDate: timezone(parseDate(item.find(".post-meta.mr-3").children("time").attr("datetime"), "YYYY年MM月DD日 HH:mm"), 8)
		};
	});
	return {
		title: $("title").text(),
		link,
		item: list
	};
}
//#endregion
export { route };
