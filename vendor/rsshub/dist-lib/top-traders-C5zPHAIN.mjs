import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/hyperdash/utils.ts
async function fetchTopTraders() {
	return await rofetch("https://hyperdash.info/api/hyperdash/top-traders-cached", { headers: { "x-api-key": "hyperdash_public_7vN3mK8pQ4wX2cL9hF5tR1bY6gS0jD" } });
}
function formatCurrency(value) {
	if (value === null || value === void 0) return "N/A";
	if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
	if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
	return `$${value.toFixed(2)}`;
}
function formatPnL(value) {
	if (value === null || value === void 0) return "N/A";
	const formatted = formatCurrency(value);
	return value >= 0 ? `+${formatted}` : formatted;
}
//#endregion
//#region lib/routes/hyperdash/top-traders.tsx
const route = {
	path: "/top-traders",
	categories: ["finance"],
	example: "/hyperdash/top-traders",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hyperdash.info/"] }],
	name: "Top Traders",
	maintainers: ["pseudoyu"],
	handler,
	description: "Get the latest top traders data from HyperDash"
};
async function handler() {
	return {
		title: "HyperDash Top Traders",
		link: "https://hyperdash.info/",
		description: "Top performing traders on HyperDash - real-time cryptocurrency derivatives trading analytics",
		item: (await fetchTopTraders()).map((trader, index) => {
			const rank = index + 1;
			const title = trader.address;
			const accountValue = formatCurrency(trader.account_value);
			const mainPosition = {
				coin: trader.main_position.coin,
				value: formatCurrency(trader.main_position.value),
				side: trader.main_position.side
			};
			const directionBias = trader.direction_bias !== null && trader.direction_bias !== void 0 ? trader.direction_bias.toFixed(2) + "%" : "N/A";
			const pnl = {
				day: formatPnL(trader.perp_day_pnl),
				week: formatPnL(trader.perp_week_pnl),
				month: formatPnL(trader.perp_month_pnl),
				alltime: formatPnL(trader.perp_alltime_pnl)
			};
			const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("h3", { children: ["Trader #", rank] }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Address:" }),
					" ",
					/* @__PURE__ */ jsx("code", { children: trader.address })
				] }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Account Value:" }),
					" ",
					accountValue
				] }),
				/* @__PURE__ */ jsx("h4", { children: "Main Position" }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Coin:" }),
					" ",
					mainPosition.coin
				] }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Position Value:" }),
					" ",
					mainPosition.value
				] }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Side:" }),
					" ",
					mainPosition.side
				] }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Direction Bias:" }),
					" ",
					directionBias
				] }),
				/* @__PURE__ */ jsx("h4", { children: "PnL Performance" }),
				/* @__PURE__ */ jsxs("table", { children: [
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Period" }), /* @__PURE__ */ jsx("th", { children: "PnL" })] }),
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "Day" }), /* @__PURE__ */ jsx("td", { children: pnl.day })] }),
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "Week" }), /* @__PURE__ */ jsx("td", { children: pnl.week })] }),
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "Month" }), /* @__PURE__ */ jsx("td", { children: pnl.month })] }),
					/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "All-time" }), /* @__PURE__ */ jsx("td", { children: pnl.alltime })] })
				] })
			] }));
			const orderTimestamp = /* @__PURE__ */ new Date((/* @__PURE__ */ new Date()).getTime() - index * 1e3);
			return {
				title,
				description,
				link: `https://hyperdash.info/trader/${trader.address}`,
				pubDate: parseDate(orderTimestamp.toISOString()),
				guid: trader.address
			};
		}),
		language: "en"
	};
}
//#endregion
export { route };
