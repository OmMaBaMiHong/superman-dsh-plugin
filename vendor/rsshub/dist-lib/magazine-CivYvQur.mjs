import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as getItem, t as baseUrl } from "./utils-Bje0iQgJ.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/qstheory/magazine.ts
const route = {
	path: "/magazine/:magazine",
	categories: ["traditional-media"],
	example: "/qstheory/magazine/qs",
	parameters: { magazine: "刊物，`qs` 为求是，`hqwglist` 为红旗文稿" },
	radar: [{ source: ["www.qstheory.cn/:magazine/mulu.htm"] }],
	name: "在线读刊",
	maintainers: ["TonyRL", "cscnk52"],
	handler
};
async function handler(ctx) {
	const { magazine } = ctx.req.param();
	const link = `${baseUrl}/${magazine}/mulu.htm`;
	const yearResponse = await rofetch(link);
	const $ = cheerio.load(yearResponse);
	const issueResponse = await rofetch($(".booktitle a").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.text(),
			link: new URL($item.attr("href"), baseUrl).href
		};
	})[0].link);
	const $$ = cheerio.load(issueResponse);
	const list = $$(".highlight a").toArray().map((item) => {
		const $item = $$(item);
		return {
			title: $item.text(),
			link: $item.attr("href")
		};
	}).toReversed().filter((item) => item.title);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => getItem(item))));
	return {
		title: $("head title").text(),
		link,
		image: new URL($(".book img").attr("src"), link).href,
		item: items
	};
}
//#endregion
export { route };
