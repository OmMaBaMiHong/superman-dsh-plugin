import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/cupl/jwc.ts
const route = {
	path: "/jwc",
	url: "jwc.cupl.edu.cn/index/tzgg.htm",
	categories: ["university"],
	example: "/cupl/jwc",
	description: "中国政法大学教务处通知公告",
	name: "教务处通知公告",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jwc.cupl.edu.cn/index/tzgg.htm", "jwc.cupl.edu.cn/"],
		target: "/jwc"
	}],
	maintainers: ["Fgju"],
	handler: async () => {
		const $ = load(await rofetch("https://jwc.cupl.edu.cn/index/tzgg.htm"));
		return {
			title: "通知公告",
			link: "https://jwc.cupl.edu.cn/index/tzgg.htm",
			description: "中国政法大学教务处通知公告",
			language: "zh-CN",
			item: $("li[id^=line_u8_]").toArray().map((elem) => {
				const elem_ = $(elem);
				const a = elem_.find("a");
				return {
					link: a[1].attribs.href,
					title: $(a[1]).text(),
					pubDate: parseDate(elem_.find("span").text(), "YYYY-MM-DD"),
					category: $(a[0]).text().slice(0, -1),
					description: ""
				};
			})
		};
	}
};
//#endregion
export { route };
