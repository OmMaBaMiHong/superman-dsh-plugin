import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/genossenschaften/index.ts
const FEED_TITLE = "Genossenschaften.immo";
const FEED_LOGO = "https://genossenschaften.immo/static/gimmo/img/favicon/favicon-128x128.png";
const FEED_LANGUAGE = "de";
const BASE_URL = "https://genossenschaften.immo";
const route = {
	name: "Immobiliensuche",
	path: "*",
	maintainers: ["sk22"],
	categories: ["other"],
	description: `Note that all parameters are optional and many can be specified multiple times
(e.g. \`district=wien-1-innere-stadt&district=wien-2-leopoldstadt\`).

Only returns the first page of search results, allowing you to keep track of
newly added apartments. If you're looking for an apartment, make sure to also
look through the other pages on the website.

::: tip
To get your query URL, go to <https://genossenschaften.immo> and apply all
desired filters. If you want to filter by (all districts of a) federal state
(e.g. \`/immobilien/regionen/wien/\`), please open the district selector and
de- and re-select any district, so that the region in the URL gets replaced
with a number of \`district\` parameters. Once you've set up all desired
filters, copy the part of the URL after the \`?\`.
:::`,
	example: "/genossenschaften/district=wien-1-innere-stadt&district=wien-2-leopoldstadt&district=wien-3-landstrasse&district=wien-4-wieden&district=wien-5-margareten&district=wien-6-mariahilf&district=wien-7-neubau&district=wien-8-josefstadt&district=wien-9-alsergrund&district=wien-10-favoriten&district=wien-11-simmering&district=wien-12-meidling&district=wien-13-hietzing&district=wien-14-penzing&district=wien-15-rudolfsheim-fuenfhaus&district=wien-16-ottakring&district=wien-17-hernals&district=wien-18-waehring&district=wien-19-doebling&district=wien-20-brigittenau&district=wien-21-floridsdorf&district=wien-22-donaustadt&district=wien-23-liesing&has_rent=on&has_rent_option=on&status=available&status=construction&cost=1000&room=2&size=50&has_property=off&has_rent=on&has_rent_option=on&status=available&status=construction&status=planned&type=residence&type=project",
	parameters: {
		cost: "Miete bis (in €, number)",
		district: "Bezirk (string, multiple)",
		size: "Größe ab (in m², number)",
		room: "Zimmer ab (number)",
		genossenschaft: "Bauvereinigung (string, multiple)",
		own_funds: "Eigenkapital bis",
		has_property: "Eigentum (`on` | `off`)",
		has_rent: "Miete (`on` | `off`)",
		has_rent_option: "Miete mit Kaufoption (`on` | `off`)",
		status: "multiple, `available` | `construction` | `planned`",
		type: "multiple, `residence` | `project`",
		keywords: "Keyword search"
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
		let path = ctx.req.path.slice(18);
		if (path.startsWith("&")) path = path.slice(1);
		const link = `${BASE_URL}/?${path}`;
		const $ = load(await rofetch(link));
		const items = $("[itemtype=\"https://schema.org/Apartment\"]").toArray().map((el) => {
			const $el = $(el);
			const name = $el.find("[itemprop=name]").text();
			const body = $el.find(".card-body").text().trim();
			const dateTime = $el.find("time").attr("datetime");
			const itemPubDate = dateTime ? /* @__PURE__ */ new Date(dateTime + "Z") : void 0;
			const itemLink = BASE_URL + $el.find("[itemprop=url]").attr("href");
			const itemImage = $el.find("[itemprop=image]").attr("href");
			const numbers = $el.find(".card-body .fs-5").toArray().map((el) => $(el).text().trim());
			const itemCategories = $el.find(".badge").toArray().map((el) => $(el).text().trim());
			return {
				title: name + (numbers.length ? ` | ${numbers.join(" · ")}` : ""),
				link: itemLink,
				pubDate: itemPubDate,
				description: itemCategories.join(" · ") + (body.length ? ` / ${body}` : ""),
				category: itemCategories,
				image: itemImage
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
