import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as GAMMA_API } from "./types-scIQ51NO.mjs";
import { n as formatOddsDisplay } from "./utils-K1gu4Ofj.mjs";
//#region lib/routes/polymarket/event.ts
const route = {
	path: "/event/:slug",
	categories: ["finance"],
	example: "/polymarket/event/presidential-election-winner-2024",
	parameters: { slug: "Event slug from the URL (e.g. presidential-election-winner-2024)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["polymarket.com/event/:slug"],
		target: "/event/:slug"
	}],
	name: "Event",
	url: "polymarket.com",
	maintainers: ["heqi201255"],
	handler
};
async function handler(ctx) {
	const event = await rofetch(`${GAMMA_API}/events/slug/${ctx.req.param("slug")}`);
	if (!event) throw new Error("Event not found");
	const items = event.markets.map((market) => ({
		title: market.question,
		description: `
            <p><strong>Odds:</strong> ${formatOddsDisplay(market)}</p>
            <p><strong>Volume:</strong> $${Number(market.volume || 0).toLocaleString()}</p>
            ${market.oneDayPriceChange ? `<p><strong>24h Change:</strong> ${(market.oneDayPriceChange * 100).toFixed(1)}%</p>` : ""}
            ${market.image ? `<img src="${market.image}" alt="${market.question}" style="max-width: 100%;">` : ""}
        `,
		link: `https://polymarket.com/event/${event.slug}`,
		pubDate: market.startDate || event.startDate ? parseDate(market.startDate || event.startDate) : void 0,
		category: event.tags?.map((t) => t.label).filter(Boolean)
	}));
	return {
		title: event.title,
		link: `https://polymarket.com/event/${event.slug}`,
		item: items,
		description: event.description
	};
}
//#endregion
export { route };
