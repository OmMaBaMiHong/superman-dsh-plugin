import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bjfu/jwc/utils.ts
async function loadContent(link) {
	const data = (await got_default.get(link)).data;
	const $ = load(data);
	return { description: ($("#con_c").length ? $("#con_c").html() : "") + ($("#con_fujian").length ? $("#con_fujian").html() : "") };
}
const ProcessFeed = (base, list, caches) => Promise.all(list.map((item) => {
	const $ = load(item);
	const $title = $("a");
	const itemUrl = new URL($title.attr("href"), base).href;
	const pubDate = timezone(parseDate($(".datetime").text().match(/\d{4}-\d{2}-\d{2}/)), 8);
	return caches.tryGet(itemUrl, async () => {
		const { description } = await loadContent(itemUrl);
		return {
			title: $title.text(),
			link: itemUrl,
			author: "北林教务处",
			description,
			pubDate
		};
	});
}));
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/bjfu/jwc/index.ts
const route = {
	path: "/jwc/:type",
	categories: ["university"],
	example: "/bjfu/jwc/jwkx",
	parameters: { type: "通知类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jwc.bjfu.edu.cn/:type/index.html"] }],
	name: "教务处通知公告",
	maintainers: ["markmingjie"],
	handler,
	description: `| 教务快讯 | 考试信息 | 课程信息 | 教改动态 | 图片新闻 |
| -------- | -------- | -------- | -------- | -------- |
| jwkx     | ksxx     | kcxx     | jgdt     | tpxw     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let title, path;
	switch (type) {
		case "jgdt":
			title = "教改动态";
			path = "jgdt/";
			break;
		case "ksxx":
			title = "考试信息";
			path = "ksxx/";
			break;
		case "kcxx":
			title = "课程信息";
			path = "tkxx/";
			break;
		case "tpxw":
			title = "图片新闻";
			path = "tpxw/";
			break;
		default:
			title = "教务快讯";
			path = "jwkx/";
	}
	const base = "http://jwc.bjfu.edu.cn/" + path;
	const data = (await got_default({
		method: "get",
		url: base
	})).data;
	const list = load(data)(".list_c li").slice(0, 15).toArray();
	const result = await utils_default.ProcessFeed(base, list, cache_default);
	return {
		title: "北林教务处 - " + title,
		link: "http://jwc.bjfu.edu.cn/" + path,
		description: "北京林业大学教务处 - " + title,
		item: result
	};
}
//#endregion
export { route };
