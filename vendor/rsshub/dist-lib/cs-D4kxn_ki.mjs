import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bit/cs/utils.ts
async function loadContent(item) {
	const $ = load((await got_default(item.link)).data);
	item.author = $(".zuozhe").children().next().first().text();
	item.description = $(".wz_art").html();
	return item;
}
const ProcessFeed = (list, caches) => {
	const host = "https://cs.bit.edu.cn/tzgg/";
	return Promise.all(list.map((item) => {
		const $ = load(item);
		const $title = $("a");
		const itemUrl = new URL($title.attr("href"), host).href;
		const single = {
			title: $title.text(),
			link: itemUrl,
			pubDate: timezone(parseDate($("span").text()), 8)
		};
		return caches.tryGet(single.link, () => loadContent(single));
	}));
};
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/bit/cs/cs.ts
const route = {
	path: "/cs",
	categories: ["university"],
	example: "/bit/cs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cs.bit.edu.cn/tzgg", "cs.bit.edu.cn/"] }],
	name: "计院通知",
	maintainers: ["sinofp"],
	handler,
	url: "cs.bit.edu.cn/tzgg"
};
async function handler() {
	const link = "https://cs.bit.edu.cn/tzgg/";
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const list = $(".box_list01 li").toArray();
	const result = await utils_default.ProcessFeed(list, cache_default);
	return {
		title: $("title").text(),
		link,
		description: $("meta[name=\"description\"]").attr("content"),
		item: result
	};
}
//#endregion
export { route };
