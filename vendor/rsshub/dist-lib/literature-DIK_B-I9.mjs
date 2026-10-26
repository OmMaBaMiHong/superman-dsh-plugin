import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseLiterature, t as baseUrl } from "./utils-COKcgAgd.mjs";
//#region lib/routes/inspirehep/literature.ts
const route = {
	path: "/literature/:q",
	example: "/inspirehep/literature/Physics",
	parameters: { q: "Search keyword" },
	name: "Literature Search",
	maintainers: ["TonyRL"],
	radar: [{
		source: ["inspirehep.net/literature"],
		target: (_params, url) => `/inspirehep/literature/${new URL(url).searchParams.get("q")}`
	}],
	handler
};
async function handler(ctx) {
	const q = ctx.req.param("q");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25;
	const items = parseLiterature((await rofetch(`${baseUrl}/api/literature`, { query: {
		sort: "mostrecent",
		size: limit,
		page: 1,
		q
	} })).hits.hits);
	return {
		title: "Literature Search - INSPIRE",
		link: `${baseUrl}/literature?sort=mostrecent&size=${limit}&page=1&q=${q}`,
		item: items
	};
}
//#endregion
export { route };
