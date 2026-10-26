import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { n as fetchItems, t as baseUrl } from "./util-fKi20ruY.mjs";
import { load } from "cheerio";
//#region lib/routes/app-sales/mostwanted.ts
const handler = async (ctx) => {
	const { time = "24h", country = "us" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL("mostwanted/", baseUrl).href;
	const $ = load(await rofetch(targetUrl, { headers: { Cookie: `countryId=${country};` } }));
	const language = $("html").attr("lang") ?? "en";
	const items = await fetchItems($, time ? `div[id$="-${time}"] div.card-panel` : "div.card-panel", targetUrl, country, limit);
	const title = $("title").text();
	const tabTitle = $(`ul.tabs li.tab a[href$="-${time}"]`).text();
	return {
		title: `${title}${tabTitle ? ` - ${tabTitle}` : ""}`,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a.brand-logo img").attr("src") ? new URL($("a.brand-logo img").attr("src"), baseUrl).href : void 0,
		author: title.split(/\|/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/mostwanted/:time?/:country?",
	name: "Watchlist Charts",
	url: "app-sales.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/app-sales/mostwanted",
	parameters: {
		time: {
			description: "Time, `24h` as Last 24h by default",
			options: [
				{
					label: "Last 24h",
					value: "24h"
				},
				{
					label: "Last Week",
					value: "week"
				},
				{
					label: "All Time",
					value: "alltime"
				}
			]
		},
		country: {
			description: "Country ID, `us` as United States by default",
			options: [
				{
					label: "United States",
					value: "us"
				},
				{
					label: "Austria",
					value: "at"
				},
				{
					label: "Australia",
					value: "au"
				},
				{
					label: "Brazil",
					value: "br"
				},
				{
					label: "Canada",
					value: "ca"
				},
				{
					label: "France",
					value: "fr"
				},
				{
					label: "Germany",
					value: "de"
				},
				{
					label: "India",
					value: "in"
				},
				{
					label: "Italy",
					value: "it"
				},
				{
					label: "Netherlands",
					value: "nl"
				},
				{
					label: "Poland",
					value: "pl"
				},
				{
					label: "Russia",
					value: "ru"
				},
				{
					label: "Spain",
					value: "es"
				},
				{
					label: "Sweden",
					value: "se"
				},
				{
					label: "Great Britain",
					value: "gb"
				}
			]
		}
	},
	description: `| Last 24h | Last Week | All Time |
| -------- | --------- | -------- |
| 24h      | week      | alltime  |

<details>
  <summary>More countries</summary>

| Currency | Country       | ID |
| -------- | ------------- | -- |
| USD      | United States | us |
| EUR      | Austria       | at |
| AUD      | Australia     | au |
| BRL      | Brazil        | br |
| CAD      | Canada        | ca |
| EUR      | France        | fr |
| EUR      | Germany       | de |
| INR      | India         | in |
| EUR      | Italy         | it |
| EUR      | Netherlands   | nl |
| PLN      | Poland        | pl |
| RUB      | Russia        | ru |
| EUR      | Spain         | es |
| SEK      | Sweden        | se |
| GBP      | Great Britain | gb |

</details>`,
	categories: ["program-update"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["app-sales.net/mostwanted"],
			target: "/mostwanted"
		},
		{
			title: "Watchlist Charts - Last 24h",
			source: ["app-sales.net/mostwanted"],
			target: "/mostwanted/24h"
		},
		{
			title: "Watchlist Charts - Last Week",
			source: ["app-sales.net/mostwanted"],
			target: "/mostwanted/week"
		},
		{
			title: "Watchlist Charts - All Time",
			source: ["app-sales.net/mostwanted"],
			target: "/mostwanted/alltime"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
