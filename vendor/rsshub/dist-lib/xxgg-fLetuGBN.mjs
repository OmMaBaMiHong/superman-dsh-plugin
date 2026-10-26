import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ctbu/xxgg.ts
const baseURL = "https://www.ctbu.edu.cn/index/xxgg.htm";
const route = {
	path: "/xxgg",
	categories: ["university"],
	example: "/ctbu/xxgg",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.ctbu.edu.cn/", "www.ctbu.edu.cn/index/xxgg.htm"] }],
	name: "学校公告",
	maintainers: ["Skylwn"],
	handler,
	url: "www.ctbu.edu.cn/"
};
async function handler() {
	const $ = load((await got_default(baseURL)).data);
	const items = $("li.clearfix").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			description: item.find("p").text(),
			pubDate: parseDate(item.find("h6").text() + "-" + item.find("em").text(), "YYYY-MM-DD"),
			link: item.find("a").attr("href")
		};
	});
	return {
		title: $("title").text(),
		link: baseURL,
		item: items
	};
}
//#endregion
export { route };
