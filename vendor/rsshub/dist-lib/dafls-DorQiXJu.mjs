import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/dafls.ts
const route = {
	path: "/dafls",
	categories: ["university"],
	example: "/nju/dafls",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dafls.nju.edu.cn/13167/list.html", "dafls.nju.edu.cn/"] }],
	name: "大学外语部",
	maintainers: ["ret-1"],
	handler,
	url: "dafls.nju.edu.cn/13167/list.html"
};
async function handler() {
	return {
		title: "大外部-通知公告",
		link: "https://dafls.nju.edu.cn/13167/list.htm",
		item: [...(await Promise.all(Object.keys({ tzgg: "通知公告" }).map(async (c) => {
			const data = (await got_default("https://dafls.nju.edu.cn/13167/list.htm")).data;
			const $ = load(data);
			return $("#article97").map((index, item) => {
				item = $(item);
				return {
					title: item.find("a").last().text(),
					link: "https://dafls.nju.edu.cn" + item.find("a").attr("href"),
					pubDate: timezone(parseDate(item.find("span").last().text(), "YYYY-MM-DD"), 8),
					category: c
				};
			});
		})))[0]]
	};
}
//#endregion
export { route };
