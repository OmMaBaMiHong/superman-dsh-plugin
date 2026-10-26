import { n as CommonDataProperties, r as CommonRouteProperties, s as getPostItems } from "./common-BRHXXVrU.mjs";
//#region lib/routes/voronoiapp/search.ts
const route = {
	...CommonRouteProperties,
	name: "Search Keyword Posts",
	path: "/search/:keyword",
	radar: [{
		source: ["www.voronoiapp.com/explore"],
		target: (_, url) => {
			return `/voronoiapp/search/${new URL(url).searchParams.get("search")}`;
		}
	}],
	example: "/voronoiapp/search/china",
	parameters: { keyword: "The keyword to search for" },
	handler: async (ctx) => {
		const { keyword } = ctx.req.param();
		const items = await getPostItems({ search: keyword });
		return {
			...CommonDataProperties,
			title: `Voronoi Posts for "${keyword}"`,
			link: `https://www.voronoiapp.com/explore?search=${encodeURIComponent(keyword)}`,
			item: items
		};
	}
};
//#endregion
export { route };
