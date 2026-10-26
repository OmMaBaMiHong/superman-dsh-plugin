import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseItems } from "./parser-r2eHm_MD.mjs";
import { load } from "cheerio";
//#region lib/routes/collabo-cafe/category.ts
const handler = async (ctx) => {
	const { category } = ctx.req.param();
	const baseUrl = `https://collabo-cafe.com/events/category/${category}`;
	return {
		title: "分类",
		link: baseUrl,
		item: parseItems(load(await rofetch(baseUrl)))
	};
};
const route = {
	path: "/category/:category",
	categories: ["anime"],
	example: "/collabo-cafe/category/cafe",
	parameters: { category: "Category, refer to the original website (ジャンル別)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["cokemine"],
	handler
};
//#endregion
export { handler, route };
