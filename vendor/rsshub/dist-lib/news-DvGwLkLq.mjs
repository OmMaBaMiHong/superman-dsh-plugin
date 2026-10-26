import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/unusualwhales/news.ts
const apiBase = "https://phx.unusualwhales.com";
const route = {
	path: "/news",
	categories: ["finance"],
	example: "/unusualwhales/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["unusualwhales.com/news", "unusualwhales.com/"] }],
	name: "News Feed",
	maintainers: ["TonyRL"],
	handler,
	url: "unusualwhales.com/news"
};
async function handler() {
	return {
		title: "Market Data - News",
		description: "Explore unusual options, options flow, dark pools, short activity, and stock activity on unusualwhales.com. Unusual whales has a full news service available!",
		link: "https://unusualwhales.com/news-feed",
		image: "https://unusualwhales.com/android-icon-192x192.png",
		language: "en-US",
		item: (await rofetch(`${apiBase}/api/news/headlines-feed?limit=100`)).data.map((item) => ({
			title: item.headline,
			link: item.url,
			guid: item.id,
			author: item.source,
			pubDate: parseDate(item.created_at),
			category: item.tickers
		}))
	};
}
//#endregion
export { route };
