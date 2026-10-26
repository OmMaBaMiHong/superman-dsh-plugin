import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/njnu/ceai/utils.ts
async function loadContent(link) {
	const $ = load((await got_default(link)).data);
	const pubDate = timezone(parseDate($("#xw_xinxi span:nth-child(1)").text(), "YYYY-MM-DD", "zh-cn"), 8);
	return {
		description: $("#xw_content").html(),
		pubDate
	};
}
const ProcessFeed = (list, caches) => Promise.all(list.map(async (item) => {
	const $title = load(item)("a");
	const itemUrl = $title.attr("href");
	const single = {
		title: $title.text(),
		link: itemUrl,
		author: "计算机与电子信息学院-人工智能学院",
		guid: itemUrl
	};
	const other = await caches.tryGet(itemUrl, () => loadContent(itemUrl));
	return {
		...single,
		...other
	};
}));
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/njnu/ceai/ceai.ts
const route = {
	path: "/ceai/:type",
	categories: ["university"],
	example: "/njnu/ceai/xszx",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "计算机与电子信息学院 - 人工智能学院",
	maintainers: ["Shujakuinkuraudo"],
	handler,
	description: `| 学院公告 | 学院新闻 | 学生资讯 |
| -------- | -------- | -------- |
| xygg     | xyxw     | xszx     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let title, path;
	switch (type) {
		case "xygg":
			title = "学院公告";
			path = "1651";
			break;
		case "xyxw":
			title = "学院新闻";
			path = "1652";
			break;
		case "xszx":
			title = "学生资讯";
			path = "1659";
			break;
		default: throw new Error(`Unknown type: ${type}`);
	}
	const list = load((await got_default("http://ceai.njnu.edu.cn/Item/List.asp?ID=" + path)).data)("span a").toArray();
	const result = await utils_default.ProcessFeed(list, cache_default);
	return {
		title: "南京师范大学计电人院 - " + title,
		link: "http://ceai.njnu.edu.cn/",
		description: "南京师范大学计电人院",
		item: result
	};
}
//#endregion
export { route };
