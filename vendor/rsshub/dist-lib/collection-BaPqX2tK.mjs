import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-6DdsewNJ.mjs";
import { load } from "cheerio";
//#region lib/routes/jianshu/collection.ts
const route = {
	path: "/collection/:id",
	categories: ["social-media"],
	view: 0,
	example: "/jianshu/collection/xYuZYD",
	parameters: { id: "专题 id, 可在专题页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.jianshu.com/c/:id"] }],
	name: "专题",
	maintainers: [
		"DIYgod",
		"HenryQW",
		"JimenezLi"
	],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const data = (await got_default({
		method: "get",
		url: `https://www.jianshu.com/c/${id}`,
		headers: { Referer: `https://www.jianshu.com/c/${id}` }
	})).data;
	const $ = load(data);
	const list = $(".note-list li").toArray();
	const result = await utils_default.ProcessFeed(list, cache_default);
	return {
		title: $("title").text(),
		link: `https://www.jianshu.com/c/${id}`,
		description: $("meta[name=\"description\"]").attr("content") || $("title").text(),
		item: result
	};
}
//#endregion
export { route };
