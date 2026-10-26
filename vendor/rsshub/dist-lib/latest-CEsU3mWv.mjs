import { n as CommonDataProperties, r as CommonRouteProperties, s as getPostItems, t as CategoryParam } from "./common-BRHXXVrU.mjs";
//#region lib/routes/voronoiapp/latest.ts
const route = {
	...CommonRouteProperties,
	name: "Latest Posts",
	path: "/latest/:category?",
	radar: [{
		source: ["www.voronoiapp.com/posts/latest"],
		target: "/latest"
	}],
	example: "/voronoiapp/latest",
	parameters: { category: CategoryParam },
	handler: async (ctx) => {
		const { category = "" } = ctx.req.param();
		const items = await getPostItems({
			swimlane: "LATEST",
			category: category === "" ? void 0 : category
		});
		return {
			...CommonDataProperties,
			title: `Voronoi Latest Posts${category ? ` - ${category}` : ""}`,
			link: "https://www.voronoiapp.com/latest",
			item: items
		};
	}
};
//#endregion
export { route };
