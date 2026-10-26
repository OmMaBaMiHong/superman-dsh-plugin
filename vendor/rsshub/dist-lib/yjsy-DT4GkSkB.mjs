import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scau/yjsy.ts
const route = {
	path: "/yjsy",
	categories: ["university"],
	example: "/scau/yjsy",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yjsy.scau.edu.cn/208/list.htm", "yjsy.scau.edu.cn/"] }],
	name: "研究生院通知",
	maintainers: ["Chunssu"],
	handler,
	url: "yjsy.scau.edu.cn/208/list.htm"
};
async function handler() {
	const link = "https://yjsy.scau.edu.cn/208/list1.htm";
	const $ = load((await got_default(link)).data);
	const list = $("#wp_news_w25 tr td tr");
	return {
		title: "华南农业大学研究生院",
		link,
		description: "通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a").last();
			return {
				title: a.text(),
				link: a.attr("href"),
				pubDate: parseDate(item.find("td").eq(2).text(), "YYYY/MM/DD")
			};
		})
	};
}
//#endregion
export { route };
