import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/wise/pair.tsx
dayjs.extend(customParseFormat);
const renderDesc = (content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("h3", { children: [
	content.source,
	" to ",
	content.target
] }), /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
		align: "left",
		style: "border: 1px solid black;",
		children: "Date"
	}), /* @__PURE__ */ jsx("th", {
		align: "left",
		style: "border: 1px solid black;",
		children: "Rate"
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", {
		style: "border: 1px solid black;",
		children: content.yesterday
	}), /* @__PURE__ */ jsx("td", {
		style: "border: 1px solid black;",
		children: content.yRate
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", {
		style: "border: 1px solid black;",
		children: content.dayBefore
	}), /* @__PURE__ */ jsx("td", {
		style: "border: 1px solid black;",
		children: content.byRate
	})] })
] }) })] }));
const route = {
	path: "/pair/:source/:target",
	categories: ["other"],
	example: "/wise/pair/GBP/USD",
	parameters: {
		source: "Base currency abbreviation",
		target: "Quote currency abbreviation"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "FX Pair Yesterday",
	maintainers: ["HenryQW"],
	handler,
	description: "Refer to [the list of supported currencies](https://wise.com/tools/exchange-rate-alerts/)."
};
async function handler(ctx) {
	let yesterday = dayjs().subtract(1, "day");
	const dayBefore = yesterday.subtract(1, "day").format("YYYY-MM-DD");
	yesterday = yesterday.format("YYYY-MM-DD");
	const source = ctx.req.param("source").toUpperCase();
	const target = ctx.req.param("target").toUpperCase();
	const link = "https://wise.com/tools/exchange-rate-alerts/";
	const guid = `wise:rates:${ctx.req.param("source")}-${ctx.req.param("target")}-${yesterday}`;
	const single = await cache_default.tryGet(guid, async () => {
		const { data } = await got_default("https://wise.com/rates/history", {
			searchParams: {
				source,
				target,
				length: 1,
				unit: "year",
				resolution: "daily"
			},
			headers: { referer: link }
		});
		const yData = data.at(-1);
		const byDate = data.at(-2);
		const yRate = yData.value;
		const byRate = byDate.value;
		const trend = yRate > byRate;
		const diff = (yRate - byRate) / yRate;
		const percent = (Math.abs(diff) * 100).toFixed(4);
		return {
			title: `${source}/${target} ${trend ? "📈" : "📉"} @${yRate} ${diff > 0 ? "" : "-"}${percent}%`,
			description: renderDesc({
				source,
				target,
				yesterday,
				yRate,
				dayBefore,
				byRate
			}),
			pubDate: parseDate(yData.time, "x"),
			guid,
			link
		};
	});
	return {
		title: `${source} to ${target} by Wise`,
		link,
		description: "Exchange Rate from Wise",
		item: [single]
	};
}
//#endregion
export { route };
