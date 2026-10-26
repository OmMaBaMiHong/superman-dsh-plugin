import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/gq/news.ts
const host = "https://www.gq.com";
const route = {
	path: "/news",
	categories: ["traditional-media"],
	view: 0,
	example: "/gq/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gq.com/"] }],
	name: "News",
	maintainers: ["EthanWng97"],
	handler
};
async function handler() {
	const rssUrl = `${host}/feed/rss`;
	const feed = await parser.parseURL(rssUrl);
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const description = load(await rofetch(item.link))("#main-content");
		description.find(".article-body__footer").remove();
		description.find("[class*=\"ContentHeaderContributorImage\"]").remove();
		description.find("h1").remove();
		return {
			title: item.title,
			pubDate: item.pubDate,
			link: item.link,
			category: item.categories,
			description: description.html()
		};
	})));
	return {
		title: "GQ",
		link: host,
		description: `GQ is the global flagship of men's fashion, the arbiter of cool for anyone who sees the world through the lens of taste and style.`,
		item: items
	};
}
//#endregion
export { route };
