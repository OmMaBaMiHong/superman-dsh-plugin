import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/foreignaffairs/rss.ts
const route = {
	path: "/rss",
	categories: ["traditional-media"],
	example: "/foreignaffairs/rss",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "RSS",
	maintainers: ["dzx-dzx"],
	handler
};
async function handler() {
	const link = "https://www.foreignaffairs.com/rss.xml";
	const feed = await parser.parseURL(link);
	return {
		title: "Foreign Affairs - RSS",
		link,
		item: await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			$(".paywall").remove();
			$(".loading-indicator").remove();
			item.description = $(".article-dropcap").html();
			item.author = item.creator;
			return item;
		})))
	};
}
//#endregion
export { route };
