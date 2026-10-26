import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/wohnnet/index.ts
const FEED_TITLE = "wohnnet.at";
const FEED_LOGO = "https://www.wohnnet.at/media/images/wohnnet/icon_192_192.png";
const FEED_LANGUAGE = "de";
const ROUTE_PATH_PREFIX = "/wohnnet/";
const BASE_URL = "https://www.wohnnet.at/immobilien/";
const route = {
	name: "Immobiliensuche",
	path: "/:category/:region/*",
	maintainers: ["sk22"],
	categories: ["other"],
	description: `
Only returns the first page of search results, allowing you to keep track of
newly added apartments. If you're looking for an apartment, make sure to also
look through the other pages on the website.

::: tip
Note that the parameter \`&sortierung=neueste-zuerst\` for chronological order
is automatically appended.
:::

::: tip
To get your query URL, go to https://www.wohnnet.at/immobilien/suche, apply
all desired filters (but at least a category and a region!) and click the
"… Treffer anzeigen" link. From the resulting URL, cut off the
\`https://www.wohnnet.at/immobilien/\` part at the beginning and replace only
the \`?\` (the \`&\`s stay as is!) after the region name with a \`/\`.

Examples:

* \`${BASE_URL}mietwohnungen/wien\`
    - → \`${ROUTE_PATH_PREFIX}mietwohnungen/wien\`
* \`${BASE_URL}mietwohnungen/wien?unterregionen=g90101\`
    - → \`${ROUTE_PATH_PREFIX}mietwohnungen/wien/unterregionen=g90101\`
* \`${BASE_URL}mietwohnungen/wien?unterregionen=g90101&merkmale=balkon\`
    - → \`${ROUTE_PATH_PREFIX}mietwohnungen/wien/unterregionen=g90101&merkmale=balkon\`
:::
`,
	example: "/wohnnet/mietwohnungen/wien/unterregionen=g90101--g90201--g90301--g90401--g90501&flaeche=40&preis=-1000",
	parameters: {
		category: "Category (`mietwohnungen`, `eigentumswohnungen`, `grundstuecke`, …)",
		region: "Region (`wien`, `oesterreich`, …)",
		unterregionen: "Unterregionen (e.g. `g90101--g90201--g90301`)",
		intention: "Intention (`kauf` | `miete`)",
		zimmer: "Zimmer (at least number, e.g. `2`)",
		flaeche: "Fläche (m², `40-` = at least 40 m², `40-60` = between 40 m² and 60 m²)",
		preis: "Preis (€, `-1000` = at most 1,000 €, `500-1000` = between 500 € and 1,000 €)",
		merkmale: "Merkmale (multiple, delimited by `--`, e.g. `balkon--garten--kurzzeitmiete--moebliert--parkplatz--provisionsfrei--sofort-beziehbar`)"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	async handler(ctx) {
		const category = ctx.req.param("category");
		const region = ctx.req.param("region");
		let path = ctx.req.path.slice(`${ROUTE_PATH_PREFIX}${category}/${region}/`.length) + "&sortierung=neueste-zuerst";
		if (path.startsWith("&")) path = path.slice(1);
		const link = `${BASE_URL}${category}/${region}/?${path}`;
		const $ = load(await rofetch(link));
		const items = $("a:has(> .realty)").toArray().map((el) => {
			const $el = $(el);
			const href = $el.attr("href");
			const [title, address] = $el.find(".realty-detail-title-address").text().split("\n").map((p) => p.trim()).filter((p) => p.length);
			const price = $el.find(".realty-detail-area-rooms .text-right").text().trim();
			const details = $el.find(".realty-detail-area-rooms").text().split("\n").map((p) => p.trim()).filter((p) => p.length);
			const badges = $el.find(".realty-detail-badges .badge").toArray().map((b) => $(b).text().trim());
			const agency = $el.find(".realty-detail-agency").text();
			const imgSrc = $el.find(".realty-image img").attr("src");
			return {
				title: `${address} · ${price} | ${title}`,
				link: new URL(href ?? "", BASE_URL).href,
				description: `${details.join(" · ")} | ${badges.join(" · ")} | ${agency}`,
				category: badges.filter((b) => !b.endsWith(" Bilder")),
				image: imgSrc ? new URL(imgSrc, BASE_URL).href : void 0
			};
		});
		return {
			title: FEED_TITLE,
			language: FEED_LANGUAGE,
			logo: FEED_LOGO,
			allowEmpty: true,
			item: items,
			link
		};
	}
};
//#endregion
export { route };
