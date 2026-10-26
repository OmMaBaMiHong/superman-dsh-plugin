import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zrblog/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/zrblog",
	radar: [{ source: ["zrblog.net/"] }],
	name: "最新文章",
	maintainers: ["cnkmmk"],
	handler,
	url: "zrblog.net/"
};
async function handler() {
	const url = "https://www.zrblog.net/";
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	return {
		title: "赵容部落",
		link: url,
		item: $("div.art_img_box").toArray().map((e) => {
			const element = $(e);
			const title = element.find("h2 > a").attr("title");
			const link = element.find("h2 > a").attr("href");
			return {
				title,
				description: element.find("p.intro").text(),
				link,
				pubDate: parseDate(element.find("div.info").find("span").eq(0).text(), "发布日期：YYYY年MM月DD日")
			};
		})
	};
}
//#endregion
export { route };
