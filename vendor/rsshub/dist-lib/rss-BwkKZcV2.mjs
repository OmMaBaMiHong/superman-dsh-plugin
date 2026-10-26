import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bulianglin/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/bulianglin",
	radar: [{ source: ["bulianglin.com/"] }],
	name: "全部文章",
	maintainers: ["cnkmmk"],
	handler,
	url: "bulianglin.com/"
};
async function handler() {
	const url = "https://bulianglin.com/";
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	return {
		title: "不良林",
		link: url,
		item: $("div.single-post").toArray().map((e) => {
			const element = $(e);
			const title = element.find("h2 > a").text();
			const link = element.find("h2 > a").attr("href");
			return {
				title,
				description: element.find("p.summary").text(),
				link,
				pubDate: parseDate(element.find("div.text-muted").find("li").eq(1).text(), "YYYY 年 MM 月 DD 日")
			};
		})
	};
}
//#endregion
export { route };
