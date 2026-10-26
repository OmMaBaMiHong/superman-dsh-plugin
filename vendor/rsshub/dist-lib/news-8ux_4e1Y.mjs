import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { t as parseItem } from "./utils-C2nR_u6B.mjs";
//#region lib/routes/coindesk/news.ts
const route = {
	path: "/news",
	categories: ["finance"],
	example: "/coindesk/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["pseudoyu"],
	handler,
	radar: [{
		source: ["coindesk.com/"],
		target: "/news"
	}],
	description: "Get latest news from CoinDesk with full text."
};
async function handler() {
	const feed = await parser.parseURL("https://feeds.feedburner.com/Coindesk");
	const validItems = (await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, () => parseItem(item))))).filter((item) => item !== null);
	return {
		title: feed.title || "CoinDesk News",
		link: feed.link || "https://coindesk.com",
		description: feed.description || "Latest news from CoinDesk",
		language: feed.language || "en",
		item: validItems
	};
}
//#endregion
export { route };
