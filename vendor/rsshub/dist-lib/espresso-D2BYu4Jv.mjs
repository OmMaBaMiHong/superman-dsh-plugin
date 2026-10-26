import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import xxhash from "xxhash-wasm";
import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";
//#region lib/routes/economist/espresso.ts
const link = "https://www.economist.com/the-world-in-brief";
const route = {
	path: "/espresso",
	categories: ["traditional-media"],
	view: 0,
	example: "/economist/espresso",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["economist.com/the-world-in-brief", "economist.com/espresso"] }],
	name: "Espresso",
	maintainers: ["TonyRL"],
	handler,
	url: "economist.com/the-world-in-brief"
};
async function handler() {
	const { h64ToString } = await xxhash();
	const { content, metadata } = (await cache_default.tryGet(link, async () => {
		const response = await rofetch(link);
		const $ = cheerio.load(response);
		return JSON.parse($("script#__NEXT_DATA__").text());
	}, config.cache.routeExpire, false)).props.pageProps;
	const items = content.gobbets.map((item) => ({
		link,
		title: sanitizeHtml(item, {
			allowedTags: [],
			allowedAttributes: {}
		}),
		pubDate: parseDate(content.datePublished),
		description: item,
		guid: `${link}#${h64ToString(item)}`
	}));
	return {
		title: metadata.title,
		link,
		description: metadata.description,
		language: "en-gb",
		image: metadata.imageUrl,
		item: items
	};
}
//#endregion
export { route };
