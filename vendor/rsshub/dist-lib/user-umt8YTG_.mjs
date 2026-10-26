import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as GAMMA_API, t as DATA_API } from "./types-scIQ51NO.mjs";
//#region lib/routes/polymarket/user.ts
const route = {
	path: "/user/:address",
	categories: ["finance"],
	example: "/polymarket/user/0x7c3db723f1d4d8cb9c550095203b686cb11e5c6b",
	parameters: { address: "Wallet address (0x...)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User Activity",
	url: "polymarket.com",
	maintainers: ["heqi201255"],
	handler
};
async function handler(ctx) {
	const address = ctx.req.param("address");
	let profile = null;
	let activity = [];
	try {
		profile = await rofetch(`${GAMMA_API}/public-profile`, { query: { address } });
	} catch {}
	try {
		activity = await rofetch(`${DATA_API}/activity`, { query: {
			user: address,
			limit: 50,
			sortBy: "TIMESTAMP",
			sortDirection: "DESC"
		} });
	} catch {}
	const displayName = profile?.name || profile?.pseudonym || address;
	const items = activity.map((act) => {
		const typeLabel = `${{
			TRADE: "💱",
			SPLIT: "✂️",
			MERGE: "🔗",
			REDEEM: "💰",
			REWARD: "🎁",
			CONVERSION: "🔄",
			MAKER_REBATE: "💵"
		}[act.type] || "📝"} ${act.type}`;
		return {
			title: act.title ? `${act.title} - ${act.outcome || `Outcome ${act.outcomeIndex}`}` : typeLabel,
			description: `
                <p><strong>Type:</strong> ${typeLabel}</p>
                ${act.side ? `<p><strong>Side:</strong> ${act.side}</p>` : ""}
                ${act.price === void 0 ? "" : `<p><strong>Price:</strong> $${act.price.toFixed(4)}</p>`}
                ${act.size === void 0 ? "" : `<p><strong>Size:</strong> ${act.size.toLocaleString()}</p>`}
                ${act.usdcSize === void 0 ? "" : `<p><strong>USDC:</strong> $${act.usdcSize.toLocaleString()}</p>`}
                ${act.icon ? `<img src="${act.icon}" alt="${act.title || "Market"}" style="max-width: 100%;">` : ""}
            `,
			link: act.eventSlug ? `https://polymarket.com/event/${act.eventSlug}` : act.slug ? `https://polymarket.com/event/${act.slug}` : "https://polymarket.com",
			pubDate: parseDate(act.timestamp * 1e3),
			author: displayName
		};
	});
	return {
		title: `Polymarket User - ${displayName}`,
		link: `https://polymarket.com/portfolio?address=${address}`,
		item: items,
		description: profile?.bio
	};
}
//#endregion
export { route };
