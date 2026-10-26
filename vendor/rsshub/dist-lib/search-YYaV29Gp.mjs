import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import "./types-scIQ51NO.mjs";
import { t as formatEventDescription } from "./utils-K1gu4Ofj.mjs";
//#region lib/routes/polymarket/search.ts
const route = {
	path: "/search/:query",
	categories: ["finance"],
	example: "/polymarket/search/trump",
	parameters: { query: "Search query" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Search",
	url: "polymarket.com",
	maintainers: ["heqi201255"],
	handler
};
async function handler(ctx) {
	const query = ctx.req.param("query");
	const items = ((await rofetch(`https://gamma-api.polymarket.com/public-search`, { query: {
		q: query,
		limit_per_type: 30
	} })).events || []).map((event) => ({
		title: event.title,
		description: formatEventDescription(event),
		link: `https://polymarket.com/event/${event.slug}`,
		pubDate: event.startDate ? parseDate(event.startDate) : void 0,
		category: event.tags?.map((t) => t.label).filter(Boolean)
	}));
	return {
		title: `Polymarket Search - ${query}`,
		link: `https://polymarket.com/search?q=${encodeURIComponent(query)}`,
		item: items
	};
}
//#endregion
export { route };
