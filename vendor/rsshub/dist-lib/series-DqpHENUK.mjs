import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as GAMMA_API } from "./types-scIQ51NO.mjs";
import { t as formatEventDescription } from "./utils-K1gu4Ofj.mjs";
//#region lib/routes/polymarket/series.ts
const route = {
	path: "/series/:slug?",
	categories: ["finance"],
	example: "/polymarket/series",
	parameters: { slug: {
		description: "Series slug, e.g. nfl, nba, mlb. If omitted, lists all series.",
		default: "all"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["polymarket.com/series/:slug"],
		target: "/series/:slug"
	}],
	name: "Series",
	url: "polymarket.com",
	maintainers: ["heqi201255"],
	handler
};
async function handler(ctx) {
	const slug = ctx.req.param("slug");
	if (slug) {
		const data = await rofetch(`${GAMMA_API}/series`, { query: {
			slug,
			limit: 1
		} });
		if (!data.length) throw new Error("Series not found");
		const series = data[0];
		const items = (series.events || []).map((event) => ({
			title: event.title,
			description: formatEventDescription(event),
			link: `https://polymarket.com/event/${event.slug}`,
			pubDate: event.startDate ? parseDate(event.startDate) : void 0,
			category: event.tags?.map((t) => t.label).filter(Boolean)
		}));
		return {
			title: `Polymarket Series - ${series.title}`,
			link: `https://polymarket.com/series/${series.slug}`,
			item: items
		};
	}
	return {
		title: "Polymarket - Series",
		link: "https://polymarket.com",
		item: (await rofetch(`${GAMMA_API}/series`, { query: {
			limit: 20,
			order: "volume",
			ascending: false
		} })).map((series) => ({
			title: series.title,
			description: `
                ${series.description ? `<p>${series.description}</p>` : ""}
                <p><strong>Volume:</strong> $${Number(series.volume || 0).toLocaleString()}</p>
                <p><strong>Liquidity:</strong> $${Number(series.liquidity || 0).toLocaleString()}</p>
                ${series.image ? `<img src="${series.image}" alt="${series.title}" style="max-width: 100%;">` : ""}
            `,
			link: `https://polymarket.com/series/${series.slug}`,
			pubDate: series.createdAt ? parseDate(series.createdAt) : void 0
		}))
	};
}
//#endregion
export { route };
