import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as GAMMA_API, t as DATA_API } from "./types-scIQ51NO.mjs";
//#region lib/routes/polymarket/positions.ts
const route = {
	path: "/positions/:address",
	categories: ["finance"],
	example: "/polymarket/positions/0x7c3db723f1d4d8cb9c550095203b686cb11e5c6b",
	parameters: { address: "Wallet address (0x...)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User Positions",
	url: "polymarket.com",
	maintainers: ["heqi201255"],
	handler
};
async function handler(ctx) {
	const address = ctx.req.param("address");
	let profile = null;
	let positions = [];
	try {
		profile = await rofetch(`${GAMMA_API}/public-profile`, { query: { address } });
	} catch {}
	try {
		positions = await rofetch(`${DATA_API}/positions`, { query: {
			user: address,
			limit: 50,
			sortBy: "CURRENT",
			sortDirection: "DESC"
		} });
	} catch {}
	const displayName = profile?.name || profile?.pseudonym || address;
	const items = positions.map((pos) => ({
		title: pos.title || `Position #${pos.conditionId.slice(0, 8)}`,
		description: `
            <p><strong>Outcome:</strong> ${pos.outcome || `#${pos.outcomeIndex}`}</p>
            <p><strong>Size:</strong> ${Number(pos.size).toLocaleString()}</p>
            <p><strong>Avg Price:</strong> $${Number(pos.avgPrice).toFixed(4)}</p>
            <p><strong>Current Price:</strong> $${Number(pos.curPrice).toFixed(4)}</p>
            <p><strong>Current Value:</strong> $${Number(pos.currentValue).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}</p>
            <p><strong>PnL:</strong> ${pos.cashPnl >= 0 ? "+" : ""}$${Number(pos.cashPnl).toFixed(2)} (${pos.percentPnl >= 0 ? "+" : ""}${Number(pos.percentPnl).toFixed(1)}%)</p>
            <img src="${pos.icon}" alt="${pos.title || "Position"}" style="max-width: 100%;">
        `,
		link: pos.eventSlug ? `https://polymarket.com/event/${pos.eventSlug}` : pos.slug ? `https://polymarket.com/event/${pos.slug}` : "https://polymarket.com",
		author: displayName
	}));
	return {
		title: `Polymarket Positions - ${displayName}`,
		link: `https://polymarket.com/portfolio?address=${address}`,
		item: items
	};
}
//#endregion
export { route };
