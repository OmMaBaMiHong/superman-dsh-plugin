import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bit/jwc/utils.ts
async function loadContent(item) {
	item.description = load((await got_default(item.link)).data)(".gp-article").html();
	return item;
}
const ProcessFeed = (list, caches) => {
	const host = "https://jwc.bit.edu.cn/tzgg/";
	return Promise.all(list.map((item) => {
		const $ = load(item);
		const $title = $("a");
		const itemUrl = new URL($title.attr("href"), host).href;
		const single = {
			title: $title.text(),
			link: itemUrl,
			author: "教务部",
			pubDate: timezone(parseDate($("span").text()), 8)
		};
		return caches.tryGet(single.link, () => loadContent(single));
	}));
};
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/bit/jwc/jwc.ts
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/bit/jwc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jwc.bit.edu.cn/tzgg", "jwc.bit.edu.cn/"] }],
	name: "教务处通知",
	maintainers: ["sinofp"],
	handler,
	url: "jwc.bit.edu.cn/tzgg"
};
async function handler() {
	const link = "https://jwc.bit.edu.cn/tzgg/";
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const list = $("li.gpTextArea").toArray();
	const result = await utils_default.ProcessFeed(list, cache_default);
	return {
		title: $("title").text(),
		link,
		description: "北京理工大学教务部",
		item: result
	};
}
//#endregion
export { route };
