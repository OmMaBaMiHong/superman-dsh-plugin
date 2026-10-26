import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ouc/it-postgraduate.ts
const route = {
	path: "/it/postgraduate",
	categories: ["university"],
	example: "/ouc/it/postgraduate",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"it.ouc.edu.cn/_s381/16619/list.psp",
		"it.ouc.edu.cn/16619/list.htm",
		"it.ouc.edu.cn/"
	] }],
	name: "信息科学与工程学院研究生招生通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "it.ouc.edu.cn/_s381/16619/list.psp"
};
async function handler() {
	const link = "https://it.ouc.edu.cn/_s381/16619/list.psp";
	const $ = load((await got_default(link)).data);
	const list = $(".col_news_list .news_list li");
	return {
		title: "中国海洋大学信息科学与工程学院",
		link,
		description: "中国海洋大学信息科学与工程学院研究生招生通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.attr("title"),
				link: new URL(a.attr("href"), link).href,
				pubDate: parseDate(item.find("span").text(), "YYYY-MM-DD")
			};
		})
	};
}
//#endregion
export { route };
