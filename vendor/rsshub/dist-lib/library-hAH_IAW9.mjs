import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scnu/library.ts
const route = {
	path: "/library",
	categories: ["university"],
	example: "/scnu/library",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["lib.scnu.edu.cn/news/zuixingonggao", "lib.scnu.edu.cn/"] }],
	name: "图书馆通知",
	maintainers: ["fengkx"],
	handler,
	url: "lib.scnu.edu.cn/news/zuixingonggao"
};
async function handler() {
	const baseUrl = "https://lib.scnu.edu.cn";
	const url = `${baseUrl}/news/zuixingonggao/`;
	const $ = load((await got_default({
		method: "get",
		url,
		headers: { Referer: baseUrl }
	})).data);
	const list = $(".article-list").find("li");
	return {
		title: $("title").text(),
		link: url,
		description: "华南师范大学图书馆 - 通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").text(),
				pubDate: parseDate(item.find(".clock").text()),
				link: item.find("a").attr("href")
			};
		})
	};
}
//#endregion
export { route };
