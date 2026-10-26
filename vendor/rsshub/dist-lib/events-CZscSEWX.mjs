import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import "./types-scIQ51NO.mjs";
import { t as formatEventDescription } from "./utils-K1gu4Ofj.mjs";
//#region lib/routes/polymarket/events.ts
const route = {
	path: "/events/:tagSlug?",
	categories: ["finance"],
	example: "/polymarket/events",
	parameters: { tagSlug: "Tag slug to filter events, e.g. politics, sports, crypto. Omit for all events." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["polymarket.com", "polymarket.com/:tagSlug"],
		target: "/events/:tagSlug"
	}],
	name: "Events",
	url: "polymarket.com",
	maintainers: ["heqi201255"],
	handler
};
async function handler(ctx) {
	const tagSlug = ctx.req.param("tagSlug");
	const query = {
		active: true,
		closed: false,
		limit: 30,
		order: "volume",
		ascending: false
	};
	if (tagSlug) query.tag_slug = tagSlug;
	const items = ((await rofetch(`https://gamma-api.polymarket.com/events/pagination`, { query })).data || []).map((event) => ({
		title: event.title,
		description: formatEventDescription(event),
		link: `https://polymarket.com/event/${event.slug}`,
		pubDate: event.startDate ? parseDate(event.startDate) : void 0,
		category: event.tags?.map((t) => t.label).filter(Boolean)
	}));
	return {
		title: `Polymarket Events${tagSlug ? ` - ${tagSlug}` : ""}`,
		link: tagSlug ? `https://polymarket.com/${tagSlug}` : "https://polymarket.com",
		item: items
	};
}
//#endregion
export { route };
