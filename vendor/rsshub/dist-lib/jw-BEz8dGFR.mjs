import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scnu/jw.ts
const route = {
	path: "/jw",
	categories: ["university"],
	example: "/scnu/jw",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jw.scnu.edu.cn/ann/index.html", "jw.scnu.edu.cn/"] }],
	name: "教务处通知",
	maintainers: ["fengkx"],
	handler,
	url: "jw.scnu.edu.cn/ann/index.html"
};
async function handler() {
	const baseUrl = "http://jw.scnu.edu.cn";
	const url = `${baseUrl}/ann/index.html`;
	const $ = load((await got_default({
		method: "get",
		url,
		headers: { Referer: baseUrl }
	})).data);
	const list = $(".notice_01").find("li");
	return {
		title: $("title").first().text(),
		link: url,
		description: "华南师范大学教务处 - 通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").text(),
				pubDate: parseDate(item.find(".time").text()),
				link: item.find("a").attr("href")
			};
		})
	};
}
//#endregion
export { route };
