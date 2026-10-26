import { t as fetchFeed } from "./utils-INacok5b.mjs";
//#region lib/routes/ruancan/category.ts
const route = {
	path: "/category/:category?",
	categories: ["new-media"],
	example: "/ruancan/category/news",
	parameters: { category: "分类 id，可在对应分类页 URL 中找到，默认为业界" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ruancan.com/cat/:category", "ruancan.com/"],
		target: "/category/:category"
	}],
	name: "分类",
	maintainers: [],
	handler,
	url: "ruancan.com/"
};
async function handler(ctx) {
	return await fetchFeed(ctx, `/cat/${ctx.req.param("category")}`);
}
//#endregion
export { route };
