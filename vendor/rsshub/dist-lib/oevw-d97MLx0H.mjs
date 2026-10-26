import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/oevw/index.ts
const FEED_LANGUAGE = "de";
const FEED_TITLE = "ÖVW Suche";
const FEED_LOGO = "https://www.oevw.at/assetversion-035142/img/layout/touch-icon.png";
const ORIGIN_URL = "https://www.oevw.at";
const BASE_URL = `${ORIGIN_URL}/suche`;
const API_URL = `${BASE_URL}/filter`;
const csrfTokenRegex = /csrfToken\s*=\s*['"](.*?)["']/;
const route = {
	name: FEED_TITLE,
	example: "/oevw/%7B%22rooms%22%3A%5B%222%22%2C%223%22%5D%7D",
	path: "/:json?",
	maintainers: ["sk22"],
	categories: ["other"],
	description: `When applying a filter on <https://www.oevw.at/suche>, a POST request is sent
to <https://www.oevw.at/suche/filter>. You can take its JSON body, URL-encode it
(\`encodeURIComponent('{...}')\`) and append it to the URL, see example URL.
for this route.`,
	parameters: { json: "JSON request body, as sent to oevw.at/suche" },
	async handler(ctx) {
		const json = JSON.parse(decodeURIComponent(ctx.req.param("json") || "{}"));
		const res = await rofetch.raw(BASE_URL);
		const cookies = res.headers.getSetCookie().map((setCookie) => setCookie.split(";", 1)[0].trim());
		const csrfToken = csrfTokenRegex.exec(res._data)[1];
		const headers = {
			Origin: ORIGIN_URL,
			Cookie: cookies.join(";"),
			"X-CSRF-Token": csrfToken,
			"X-Requested-With": "XMLHttpRequest",
			Accept: "*/*"
		};
		const $ = load(await rofetch(API_URL, {
			body: JSON.stringify(json),
			method: "POST",
			headers
		}));
		const items = $(".thumb").toArray().map((el) => {
			const $el = $(el);
			const subtitle = $el.find(".thumb__info").text();
			const title = $el.find(".thumb__heading").text();
			const badge = $el.find(".thumb__badge").text().trim();
			const link = $el.find(".thumb__link a").attr("href");
			const image = $el.find(".thumb__image").attr("src");
			const description = $el.find(".thumb__text__item").toArray().map((item) => $(item).text()).join(", ");
			return {
				title: `${subtitle} – ${title}`,
				link,
				description: (badge ? `${badge}, ` : "") + description,
				image: `${ORIGIN_URL}/${image}`,
				category: badge ? [badge] : void 0
			};
		});
		return {
			title: FEED_TITLE,
			language: FEED_LANGUAGE,
			logo: FEED_LOGO,
			allowEmpty: true,
			item: items,
			link: BASE_URL
		};
	}
};
//#endregion
export { route };
