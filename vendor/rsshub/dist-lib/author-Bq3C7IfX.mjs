import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as parseLiterature, t as baseUrl } from "./utils-COKcgAgd.mjs";
//#region lib/routes/inspirehep/author.ts
const route = {
	path: "/authors/:id",
	example: "/inspirehep/authors/1696909",
	parameters: { id: "Author ID" },
	name: "Author Search",
	maintainers: ["TonyRL"],
	radar: [{ source: ["inspirehep.net/authors/:id"] }],
	handler
};
const getAuthorById = (id) => cache_default.tryGet(`inspirehep:author:${id}`, () => rofetch(`${baseUrl}/api/authors/${id}`, {
	headers: { accept: "application/vnd+inspire.record.ui+json" },
	parseResponse: JSON.parse
}));
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25;
	const authorInfo = await getAuthorById(id);
	const items = parseLiterature((await rofetch(`${baseUrl}/api/literature`, { query: {
		sort: "mostrecent",
		size: limit,
		page: 1,
		search_type: "hep-author-publication",
		author: authorInfo.metadata.facet_author_name
	} })).hits.hits);
	return {
		title: `${authorInfo.metadata.name.preferred_name} - INSPIRE`,
		link: `${baseUrl}/authors/${id}`,
		item: items
	};
}
//#endregion
export { getAuthorById, route };
