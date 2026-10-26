import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/gra.ts
const route = {
	path: "/gra",
	categories: ["university"],
	example: "/nju/gra",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["grawww.nju.edu.cn/main.htm", "grawww.nju.edu.cn/"] }],
	name: "研究生院",
	maintainers: ["ret-1"],
	handler,
	url: "grawww.nju.edu.cn/main.htm"
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "https://grawww.nju.edu.cn/905/list.htm"
	})).data;
	const $ = load(data);
	return {
		title: "研究生院-动态通知",
		link: "https://grawww.nju.edu.cn/905/list.htm",
		item: $("li.news").toArray().map((item) => {
			item = $(item);
			const year = item.find(".news_days").first().text();
			const day = item.find(".news_year").first().text();
			if (!year.length || !day.length) return null;
			return {
				title: item.find("a").attr("title"),
				link: "https://grawww.nju.edu.cn" + item.find("a").attr("href"),
				pubDate: timezone(parseDate(year + day, "YYYYMM-DD"), 8)
			};
		}).filter(Boolean)
	};
}
//#endregion
export { route };
