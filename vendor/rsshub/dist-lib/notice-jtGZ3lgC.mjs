import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ncwu/notice.ts
const baseUrl = "https://www.ncwu.edu.cn/xxtz.htm";
const route = {
	path: "/notice",
	categories: ["university"],
	example: "/ncwu/notice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ncwu.edu.cn/xxtz.htm"] }],
	name: "学校通知",
	maintainers: [],
	handler,
	url: "ncwu.edu.cn/xxtz.htm"
};
async function handler() {
	const $ = load((await got_default(baseUrl)).data);
	const list = $("div.news-item").toArray().map((item) => {
		item = $(item);
		return {
			title: "「" + item.find("a.dw").text() + "」" + item.find("a.dw").next().text(),
			description: item.find("div.detail").text(),
			pubDate: parseDate(item.find("div.month").text() + "-" + item.find("div.day").text(), "YYYY-MM-DD"),
			link: item.find("a.dw").next().attr("href")
		};
	});
	return {
		title: $("title").text(),
		link: baseUrl,
		item: list
	};
}
//#endregion
export { route };
