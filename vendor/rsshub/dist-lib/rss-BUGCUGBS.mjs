import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zhujiceping/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/zhujiceping",
	radar: [{ source: ["zhujiceping.com/"] }],
	name: "最新发布",
	maintainers: ["cnkmmk"],
	handler,
	url: "zhujiceping.com/"
};
async function handler() {
	const url = "https://www.zhujiceping.com/";
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	return {
		title: "国外主机测评",
		link: url,
		item: $("article.excerpt").toArray().map((e) => {
			const element = $(e);
			const title = element.find("h2 > a").attr("title");
			const link = element.find("h2 > a").attr("href");
			return {
				title,
				description: element.find("p.note").text(),
				link,
				pubDate: parseDate(element.find("time").text(), "YYYY-MM-DD")
			};
		})
	};
}
//#endregion
export { route };
