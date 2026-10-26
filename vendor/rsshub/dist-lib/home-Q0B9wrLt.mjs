import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-6DdsewNJ.mjs";
import { load } from "cheerio";
//#region lib/routes/jianshu/home.ts
const route = {
	path: "/home",
	categories: ["social-media"],
	view: 0,
	example: "/jianshu/home",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.jianshu.com/"] }],
	name: "首页",
	maintainers: [
		"DIYgod",
		"HenryQW",
		"JimenezLi"
	],
	handler,
	url: "www.jianshu.com/"
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "https://www.jianshu.com",
		headers: { Referer: "https://www.jianshu.com" }
	})).data;
	const $ = load(data);
	const list = $(".note-list li").toArray();
	const result = await utils_default.ProcessFeed(list, cache_default);
	return {
		title: "简书首页",
		link: "https://www.jianshu.com",
		description: $("meta[name=\"description\"]").attr("content"),
		item: result
	};
}
//#endregion
export { route };
