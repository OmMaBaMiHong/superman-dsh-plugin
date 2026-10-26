import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as processItems, t as fetchData } from "./utils-B52ppy60.mjs";
//#region lib/routes/skebetter/manga.ts
const route = {
	path: "/manga/:order",
	categories: ["anime"],
	example: "/skebetter/manga/1",
	parameters: { order: "Order, see below." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Manga",
	maintainers: ["SnowAgar25"],
	handler,
	radar: [{
		title: "Manga - Latest",
		source: ["skebetter.com/series"],
		target: "/manga/1"
	}, {
		title: "Manga - Hot",
		source: ["skebetter.com/series"],
		target: "/manga/2"
	}],
	description: `| 新着 (Latest) | 人気 (Hot) |
| ------------- | ---------- |
| 1             | 2          |`
};
async function handler(ctx) {
	const order = ctx.req.param("order") ?? "1";
	const baseUrl = "https://api.twieromanga.com/api/mangaseries";
	const orderMap = {
		"1": "新着",
		"2": "人気"
	};
	const url = `${baseUrl}?order=${order}`;
	const items = await cache_default.tryGet(url, async () => {
		return processItems(await fetchData(url, true), "manga");
	}, config.cache.routeExpire, false);
	return {
		title: `Skebetter Manga - ${orderMap[order]}`,
		link: `https://skebetter.com/series?order=${order}`,
		item: items
	};
}
//#endregion
export { route };
