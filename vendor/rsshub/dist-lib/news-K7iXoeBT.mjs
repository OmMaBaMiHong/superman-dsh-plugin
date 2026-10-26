import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hust/aia/news.ts
const route = {
	path: ["/aia/news", "/auto/news"],
	categories: ["university"],
	example: "/hust/aia/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["aia.hust.edu.cn/xyxw.htm", "aia.hust.edu.cn/"] }],
	name: "人工智能和自动化学院新闻",
	maintainers: ["budui"],
	handler,
	url: "aia.hust.edu.cn/xyxw.htm"
};
async function handler() {
	const link = "https://aia.hust.edu.cn/xyxw.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".list li");
	return {
		title: "华科人工智能和自动化学院新闻",
		link,
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a h2").text(),
				description: item.find("a div").text() || "华科人工智能和自动化学院新闻",
				pubDate: parseDate(item.find(".date3").text(), "DDYYYY-MM"),
				link: new URL(item.find("a").attr("href"), link).href
			};
		})
	};
}
//#endregion
export { route };
