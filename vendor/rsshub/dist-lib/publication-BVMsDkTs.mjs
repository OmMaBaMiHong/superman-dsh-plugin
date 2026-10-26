import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/dblp/publication.ts
const route = {
	path: "/:field",
	categories: ["study"],
	example: "/dblp/knowledge%20tracing",
	parameters: { field: "Research field" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dblp.org/:field"] }],
	name: "Keyword Search",
	maintainers: ["ytno1"],
	handler
};
async function handler(ctx) {
	const field = ctx.req.param("field");
	const { result: { hits } } = await rofetch("https://dblp.org/search/publ/api", {
		query: {
			q: field,
			format: "json",
			h: 10
		},
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
	});
	const { hit: data } = hits;
	const list = data.map((item) => {
		const { info } = item;
		const { authors: { author }, title, venue, year, type, doi, ee } = info;
		return {
			title,
			link: ee,
			author: `${Array.isArray(author) ? author[0].text : author.text} et al.`,
			doi,
			description: `Year: ${year ?? "unknown"}, Venue: ${venue}, Type: ${type}, Doi: ${doi}`
		};
	});
	return {
		title: `【dblp】${field}`,
		link: `https://dblp.org/search?q=${field}`,
		description: `DBLP ${field} RSS`,
		item: list
	};
}
//#endregion
export { route };
