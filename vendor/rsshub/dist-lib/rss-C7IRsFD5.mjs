import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/playpcesor/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/playpcesor",
	radar: [{ source: ["playpcesor.com/"] }],
	name: "每日精选文章",
	maintainers: ["cnkmmk"],
	handler,
	url: "playpcesor.com/"
};
async function handler() {
	const url = "https://www.playpcesor.com/";
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	return {
		title: "电脑玩物",
		link: url,
		item: $("article[class='post-outer-container']").toArray().map((e) => {
			const element = $(e);
			const title = element.find("h3 > a").text();
			const link = element.find("h3 > a").attr("href");
			return {
				title,
				description: element.find("div[class=\"snippet-item r-snippetized\"]").text(),
				link,
				pubDate: parseDate(element.find("time").attr("datetime"), "YYYY-MM-DDTHH:mm:ss+08:00")
			};
		})
	};
}
//#endregion
export { route };
