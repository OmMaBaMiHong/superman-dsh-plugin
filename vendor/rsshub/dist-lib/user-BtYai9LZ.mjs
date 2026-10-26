import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-6DdsewNJ.mjs";
import { load } from "cheerio";
//#region lib/routes/jianshu/user.ts
const route = {
	path: "/user/:id",
	categories: ["social-media"],
	example: "/jianshu/user/yZq3ZV",
	view: 0,
	parameters: { id: "作者 id, 可在作者主页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.jianshu.com/u/:id"] }],
	name: "作者",
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
		url: `https://www.jianshu.com/u/${id}`,
		headers: { Referer: `https://www.jianshu.com/u/${id}` }
	})).data;
	const $ = load(data);
	const list = $(".note-list li").toArray();
	const result = await utils_default.ProcessFeed(list, cache_default);
	return {
		title: $("title").text(),
		link: `https://www.jianshu.com/u/${id}`,
		description: $("meta[name=\"description\"]").attr("content") || $("title").text(),
		item: result
	};
}
//#endregion
export { route };
