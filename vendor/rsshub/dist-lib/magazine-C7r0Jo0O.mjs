import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/magnumphotos/magazine.ts
const host = "https://www.magnumphotos.com";
const route = {
	path: "/magazine",
	categories: ["picture"],
	view: 2,
	example: "/magnumphotos/magazine",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["magnumphotos.com/"] }],
	name: "Magazine",
	maintainers: ["EthanWng97"],
	handler,
	url: "magnumphotos.com/"
};
async function handler() {
	const rssUrl = `${host}/feed/`;
	const feed = await parser.parseURL(rssUrl);
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		if (!item.link) return;
		const description = load(await rofetch(item.link))("#content");
		description.find("ul.share").remove();
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
		title: "Magnum Photos",
		link: host,
		description: "Magnum is a community of thought, a shared human quality, a curiosity about what is going on in the world, a respect for what is going on and a desire to transcribe it visually",
		item: items
	};
}
//#endregion
export { route };
