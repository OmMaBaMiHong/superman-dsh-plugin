import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/dayanzai/index.ts
const rootUrl = "http://www.dayanzai.me/";
const route = {
	path: "/:category/:fulltext?",
	categories: ["blog"],
	example: "/dayanzai/windows",
	parameters: {
		category: "分类",
		fulltext: "是否获取全文，需要获取则传入参数`y`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["dayanzai.me/:category", "dayanzai.me/:category/*"],
		target: "/:category"
	}],
	name: "分类",
	maintainers: [],
	handler,
	description: `| 微软应用 | 安卓应用 | 教程资源 | 其他资源 |
| -------- | -------- | -------- | -------- |
| windows  | android  | tutorial | other    |`
};
async function handler(ctx) {
	const { category, fulltext } = ctx.req.param();
	const currentUrl = rootUrl + category;
	const $ = load((await got_default.get(currentUrl)).data);
	const lists = $("div.c-box > div > div.c-zx-list > ul > li");
	const reg = /日期：(.*?(?:\s\(.*?\))?)\s/;
	const list = lists.toArray().map((item) => {
		item = $(item).find("div");
		let date = reg.exec(item.find("div.r > p.other").text())[1];
		if (date.includes("周") || date.includes("月")) {
			date = /\((.*?)\)/.exec(date)[1];
			date = parseDate(date, "MM-DD");
		} else if (date.includes("年")) {
			date = /\((.*?)\)/.exec(date)[1];
			date = parseDate(date, "YYYY-MM-DD");
		} else date = parseRelativeDate(date);
		return {
			title: item.find("div.r > p.r-top > span > a").text(),
			pubDate: timezone(date, 8),
			description: item.find("div.r > p.desc").text(),
			link: item.find("div.r > p.r-top > span > a").attr("href")
		};
	});
	const items = fulltext === "y" ? await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default.get(item.link)).data)("div.intro-box").html();
		return item;
	}))) : list;
	return {
		title: `大眼仔旭 ${category}`,
		link: currentUrl,
		description: `大眼仔旭 ${category} RSS`,
		item: items
	};
}
//#endregion
export { route };
