import { n as CommonDataProperties, r as CommonRouteProperties, s as getPostItems, t as CategoryParam } from "./common-BRHXXVrU.mjs";
//#region lib/routes/voronoiapp/editors-pick.ts
const route = {
	...CommonRouteProperties,
	name: "Editor's Pick Posts",
	path: "/editors-pick/:category?",
	radar: [{
		source: ["www.voronoiapp.com/posts/editors-pick"],
		target: "/editors-pick"
	}],
	example: "/voronoiapp/editors-pick",
	parameters: { category: CategoryParam },
	handler: async (ctx) => {
		const { category = "" } = ctx.req.param();
		const items = await getPostItems({
			swimlane: "CURATED",
			category: category === "" ? void 0 : category
		});
		return {
			...CommonDataProperties,
			title: `Voronoi Editor's Pick Posts${category ? ` - ${category}` : ""}`,
			link: "https://www.voronoiapp.com/editors-pick",
			item: items
		};
	}
};
//#endregion
export { route };
