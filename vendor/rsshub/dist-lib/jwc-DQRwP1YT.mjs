import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/njnu/jwc/utils.ts
async function loadContent(link) {
	const $ = load((await got_default(link)).data);
	const pubDate = timezone(parseDate($("span+ span").text(), "YYYY-MM-DD", "zh-cn"), 8);
	return {
		description: $("form > div").html(),
		pubDate
	};
}
const ProcessFeed = (list, caches) => {
	const host = "http://jwc.njnu.edu.cn/";
	return Promise.all(list.map(async (item) => {
		const $title = load(item)("a");
		const itemUrl = new URL($title.attr("href"), host);
		const single = {
			title: $title.text(),
			link: itemUrl,
			author: "教务处",
			guid: itemUrl
		};
		const other = await caches.tryGet(itemUrl, () => loadContent(itemUrl));
		return {
			...single,
			...other
		};
	}));
};
//#endregion
//#region lib/routes/njnu/jwc/jwc.ts
const route = {
	path: "/jwc/:type",
	categories: ["university"],
	example: "/njnu/jwc/xstz",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务通知",
	maintainers: ["Shujakuinkuraudo"],
	handler,
	description: `| 教师通知 | 新闻动态 | 学生通知 |
| -------- | -------- | -------- |
| jstz     | xwdt     | xstz     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let title, path;
	switch (type) {
		case "jstz":
			title = "教师通知";
			path = "jstz.htm";
			break;
		case "xwdt":
			title = "新闻动态";
			path = "xwdt.htm";
			break;
		case "xstz":
			title = "学生通知";
			path = "xstz.htm";
			break;
		default: throw new Error(`Unknown type: ${type}`);
	}
	const result = await ProcessFeed(load((await got_default("http://jwc.njnu.edu.cn/index/" + path)).data)(".list_txt a").toArray(), cache_default);
	return {
		title: "南京师范大学教务处 - " + title,
		link: "http://jwc.njnu.edu.cn/",
		description: "南京师范大学教务处",
		item: result
	};
}
//#endregion
export { route };
