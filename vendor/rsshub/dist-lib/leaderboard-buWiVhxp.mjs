import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as DATA_API } from "./types-scIQ51NO.mjs";
//#region lib/routes/polymarket/leaderboard.ts
const route = {
	path: "/leaderboard/:category?/:timePeriod?",
	categories: ["finance"],
	example: "/polymarket/leaderboard",
	parameters: {
		category: {
			description: "Market category: OVERALL, POLITICS, SPORTS, CRYPTO, CULTURE, MENTIONS, WEATHER, ECONOMICS, TECH, FINANCE",
			default: "OVERALL"
		},
		timePeriod: {
			description: "Time period: DAY, WEEK, MONTH, ALL",
			default: "DAY"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Leaderboard",
	url: "polymarket.com",
	maintainers: ["heqi201255"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") || "OVERALL";
	const timePeriod = ctx.req.param("timePeriod") || "DAY";
	const items = (await rofetch(`${DATA_API}/v1/leaderboard`, { query: {
		category,
		timePeriod,
		orderBy: "PNL",
		limit: 50
	} })).map((entry) => ({
		title: `#${entry.rank} ${entry.userName || entry.proxyWallet}`,
		description: `
            <p><strong>Rank:</strong> #${entry.rank}</p>
            <p><strong>PnL:</strong> $${Number(entry.pnl).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}</p>
            <p><strong>Volume:</strong> $${Number(entry.vol).toLocaleString()}</p>
            ${entry.xUsername ? `<p><strong>X:</strong> @${entry.xUsername}</p>` : ""}
            ${entry.verifiedBadge ? "<p>✅ Verified</p>" : ""}
            ${entry.profileImage ? `<img src="${entry.profileImage}" alt="${entry.userName || "Trader"}" style="max-width: 100px; border-radius: 50%;">` : ""}
        `,
		link: `https://polymarket.com/portfolio?address=${entry.proxyWallet}`,
		author: entry.userName || entry.proxyWallet
	}));
	return {
		title: `Polymarket Leaderboard - ${category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()} (${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1).toLowerCase()})`,
		link: "https://polymarket.com/leaderboard",
		item: items
	};
}
//#endregion
export { route };
