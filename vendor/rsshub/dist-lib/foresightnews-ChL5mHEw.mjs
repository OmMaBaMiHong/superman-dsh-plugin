import { a as rootUrl, i as processItems, n as icon, r as image, t as apiRootUrl } from "./util-D01LOS98.mjs";
//#region lib/routes/foresightnews/index.ts
const route = {
	path: "/",
	categories: ["new-media"],
	example: "/foresightnews",
	radar: [{
		source: ["foresightnews.pro/"],
		target: ""
	}],
	name: "精选资讯",
	maintainers: ["nczitzk"],
	handler,
	url: "foresightnews.pro/"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const apiUrl = new URL("v2/feed", apiRootUrl).href;
	const { items } = await processItems(apiUrl, limit);
	return {
		item: items,
		title: "Foresight News - 精选资讯",
		link: rootUrl,
		description: "FN精选 - Foresight News",
		language: "zh-cn",
		image,
		icon,
		logo: icon,
		subtitle: "精选资讯",
		author: "Foresight News"
	};
}
//#endregion
export { route };
