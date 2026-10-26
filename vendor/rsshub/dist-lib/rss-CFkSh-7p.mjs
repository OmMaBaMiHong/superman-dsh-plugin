import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/daoxuan/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/daoxuan",
	radar: [{ source: ["daoxuan.cc/"] }],
	name: "推荐阅读文章",
	maintainers: ["dx2331lxz"],
	url: "daoxuan.cc/",
	handler
};
async function handler() {
	const url = "https://daoxuan.cc/";
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	return {
		title: "道宣的窝",
		link: url,
		item: $("div.recent-post-item").toArray().map((item) => {
			item = $(item);
			const a = item.find("a.article-title").first();
			const timeElement = item.find("time").first();
			return {
				title: a.attr("title"),
				link: `https://daoxuan.cc${a.attr("href")}`,
				pubDate: parseDate(timeElement.attr("datetime")),
				description: a.attr("title")
			};
		})
	};
}
//#endregion
export { route };
