import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as rootUrl, t as renderPostDetail } from "./util-C8fESqOX.mjs";
import { load } from "cheerio";
//#region lib/routes/taoguba/index.ts
const route = {
	path: "/:category?",
	categories: ["finance"],
	example: "/taoguba",
	parameters: { id: "分类，见下表，默认为社区总版" },
	name: "淘股论坛",
	maintainers: ["nczitzk"],
	handler,
	description: `| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |
| -------- | -------- | -------- | -------- |
| bbs      | zongban  | jinghua  | dianzan  |`
};
async function handler(ctx) {
	const currentUrl = `${rootUrl}/${ctx.req.param("category") ?? "zongban"}/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".Nbbs-tiezi-lists").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 70).toArray().map((item) => {
		item = $(item);
		const a = item.find(".middle-list-tittle a");
		return {
			title: a.text().trim(),
			link: `${rootUrl}/${a.attr("href")}`,
			author: item.find(".middle-list-user a").text().trim()
		};
	});
	items = await Promise.all(items.map(async (item) => await renderPostDetail(item)));
	return {
		title: $("head title").text().trim().split("_", 1)[0],
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
