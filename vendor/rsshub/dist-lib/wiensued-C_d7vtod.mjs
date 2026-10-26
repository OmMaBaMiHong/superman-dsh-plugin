import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { load } from "cheerio";
//#region lib/routes/wiensued/index.ts
const FEED_LANGUAGE = "de";
const FEED_LOGO = "https://www.wiensued.at/wp-content/uploads/logo_wiensued_ohneclaim.svg";
const BASE_URL = "https://www.wiensued.at/";
const route = {
	name: "Objekte",
	example: "/wiensued/city=Wien&search=&space-from=30&space-to=100&room-from=2&room-to=4&rent=1&property=1&state[]=inplanung&state[]=inbau&state[]=sofort&state[]=bestand",
	path: "*",
	maintainers: ["sk22"],
	categories: ["other"],
	description: `Pass in the parameters (e.g. \`city=Wien&state[]=sofort\`) and/or the path
leading up to the listing (e.g. \`wohnen/sofort-verfuegbar\`)`,
	async handler(ctx) {
		const parts = getSubPath(ctx).split("/");
		const subPaths = parts.filter((p) => p.length && !p.includes("="));
		if (subPaths.length === 0) subPaths.push("wohnen");
		let params = parts.at(-1).includes("=") ? parts.at(-1) : "";
		if (params.startsWith("&")) params = params.slice(1);
		const link = `${BASE_URL}${subPaths.join("/")}?${params}`;
		const $ = load(await rofetch(link));
		const title = $("title").text();
		const items = $("#search-results").next().next().find(".object-box").toArray().map((el) => {
			const $el = $(el);
			const $image = $el.find(".image img");
			const link = $el.find(".link a").attr("href");
			const image = $image.attr("data-lazy-src") || $image.attr("src");
			const title = $el.find(".address h4").first().text().trim();
			const subtitle = $el.find(".address p").first().text().trim();
			const $text = $el.find(".text");
			const description = $text.find(".labtxtline").toArray().map((el) => $(el).children().toArray().map((c) => $(c).text().trim()).join(": ")).join(", ");
			return {
				title: `${title}, ${subtitle}`,
				link,
				description,
				image,
				content: {
					html: $text.html() ?? $text.text(),
					text: $text.text()
				}
			};
		});
		return {
			title,
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
