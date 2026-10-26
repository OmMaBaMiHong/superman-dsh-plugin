import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/nytimes/rss.ts
const route = {
	path: "/rss/:cat?",
	categories: ["traditional-media"],
	view: 0,
	example: "/nytimes/rss/HomePage",
	parameters: { cat: { description: "Category name, corresponding to the last segment of [official feed's](https://www.nytimes.com/rss) url." } },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["nytimes.com/"],
		target: ""
	}],
	name: "News",
	maintainers: [
		"HenryQW",
		"pseudoyu",
		"dzx-dzx"
	],
	handler,
	url: "nytimes.com/",
	description: "Enhance the official EN RSS feed"
};
async function handler(ctx) {
	const url = `https://rss.nytimes.com/services/xml/rss/nyt/${ctx.req.param("cat")}.xml`;
	const rss = await parser.parseURL(url);
	return {
		...rss,
		item: await Promise.all(rss.items.map((e) => cache_default.tryGet(e.link, async () => {
			const $ = load(await rofetch(e.link, {
				headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
				referer: "https://www.google.com/"
			}));
			return {
				...e,
				description: $("[name='articleBody']").html(),
				author: $("meta[name=\"byl\"]").attr("content")
			};
		})))
	};
}
//#endregion
export { route };
