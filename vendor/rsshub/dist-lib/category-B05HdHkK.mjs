import { r as getPostsBy, t as getBySlug } from "./utils-Bpk3tkLu.mjs";
//#region lib/routes/chikubi/category.ts
const route = {
	path: "/category/:keyword",
	categories: ["multimedia"],
	example: "/chikubi/category/nipple-lesbian",
	parameters: { keyword: "Keyword" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Category",
	maintainers: ["SnowAgar25"],
	handler,
	radar: [{
		title: "Category",
		source: ["chikubi.jp/category/:keyword"],
		target: "/category/:keyword"
	}]
};
async function handler(ctx) {
	const baseUrl = "https://chikubi.jp";
	const { keyword } = ctx.req.param();
	const { id, name } = await getBySlug("category", keyword);
	const items = await getPostsBy("category", id);
	return {
		title: `Category: ${name} - chikubi.jp`,
		link: `${baseUrl}/category/${keyword}`,
		item: items
	};
}
//#endregion
export { route };
