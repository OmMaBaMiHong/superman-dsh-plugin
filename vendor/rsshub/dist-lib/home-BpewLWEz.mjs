import { n as CommonDataProperties, r as CommonRouteProperties, s as getPostItems, t as CategoryParam } from "./common-BRHXXVrU.mjs";
//#region lib/routes/voronoiapp/home.ts
const route = {
	...CommonRouteProperties,
	name: "Home Posts",
	path: "/home/:category?",
	description: "This is the home page of Voronoi App",
	radar: [{
		source: ["www.voronoiapp.com", "www.voronoiapp.com/posts/voronoi"],
		target: "/home"
	}],
	example: "/voronoiapp/home",
	parameters: { category: CategoryParam },
	handler: async (ctx) => {
		const { category = "" } = ctx.req.param();
		const items = await getPostItems({
			feed: "VORONOI",
			category: category === "" ? void 0 : category
		});
		return {
			...CommonDataProperties,
			title: `Voronoi Home Posts${category ? ` - ${category}` : ""}`,
			link: "https://www.voronoiapp.com",
			item: items
		};
	}
};
//#endregion
export { route };
