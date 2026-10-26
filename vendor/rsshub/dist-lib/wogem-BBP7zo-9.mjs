import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/wogem/index.ts
const FEED_TITLE = "WOGEM";
const FEED_LANGUAGE = "de";
const FEED_LOGO = "https://www.wogem.at/de/favicon.ico";
const BASE_URL = "https://www.wogem.at/de/";
const route = {
	name: "Angebote",
	example: "/wogem/angebote?filter=Graz",
	path: "/:page?",
	maintainers: ["sk22"],
	categories: ["other"],
	description: "Pass in the name of the php file, e.g. `angebote` for \\`/de/angebote.php\\`\\`.",
	parameters: { page: "Page name, e.g. `angebote` for `angebote.php. Defaults to `angebote`" },
	async handler(ctx) {
		const page = ctx.req.param("page") || "angebote";
		const link = `${BASE_URL}${page}.php`;
		const $ = load(await rofetch(link));
		const heading = $("h1").text().split("\n", 1)[0].trim();
		const items = $(".col-md-12 > h3 > a").toArray().map((el) => {
			const $el = $(el);
			const href = $el.attr("href");
			return {
				title: $el.text(),
				link: href?.startsWith("?") ? link + href : href
			};
		});
		return {
			title: `${heading} - ${FEED_TITLE}`,
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
