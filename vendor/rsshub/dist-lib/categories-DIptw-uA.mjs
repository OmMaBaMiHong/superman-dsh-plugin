import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { i as playwrightFetch, n as getItem, r as parseList, t as baseUrl } from "./utils-Dzwiht9d.mjs";
//#region lib/routes/javtrailers/categories.ts
const route = {
	path: "/categories/:category",
	categories: ["multimedia"],
	example: "/javtrailers/categories/50001755",
	parameters: { category: "Category name, can be found in the URL of the category page" },
	radar: [{ source: ["javtrailers.com/categories/:category"] }],
	name: "Categories",
	maintainers: ["TonyRL"],
	url: "javtrailers.com/categories",
	handler,
	features: {
		nsfw: true,
		requirePuppeteer: true
	}
};
async function handler(ctx) {
	const { category } = ctx.req.param();
	const context = await outPlaywright();
	const response = await playwrightFetch(`${baseUrl}/api/categories/${category}?page=0`, context);
	const list = parseList(response.videos);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => getItem(item, context))));
	await context.close();
	return {
		title: `Watch ${response.category.name} Jav Online | Japanese Adult Video - JavTrailers.com`,
		description: `Watch ${response.category.name} Jav video’s free, we have the largest Jav collections with high definition`,
		link: `${baseUrl}/categories/${category}`,
		item: items
	};
}
//#endregion
export { route };
