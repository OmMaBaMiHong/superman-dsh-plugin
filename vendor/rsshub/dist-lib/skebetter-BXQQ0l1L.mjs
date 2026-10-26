import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as processItems, t as fetchData } from "./utils-B52ppy60.mjs";
//#region lib/routes/skebetter/index.ts
const route = {
	path: "/:type",
	categories: ["anime"],
	example: "/skebetter/hot",
	parameters: { type: "Type, see below" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Hot",
	maintainers: ["SnowAgar25"],
	handler,
	radar: [
		{
			title: "Skebetter - Hot",
			source: ["skebetter.com"],
			target: "/hot"
		},
		{
			title: "Skebetter - Week",
			source: ["skebetter.com"],
			target: "/week"
		},
		{
			title: "Skebetter - Month",
			source: ["skebetter.com"],
			target: "/month"
		},
		{
			title: "Skebetter - Latest",
			source: ["skebetter.com"],
			target: "/latest"
		}
	],
	description: `| 急上昇 | 週間 | 月間  | 新着   |
| ------ | ---- | ----- | ------ |
| hot    | week | month | latest |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const baseUrl = "https://api.twieromanga.com/api/hotv2";
	const typeMap = {
		hot: "急上昇",
		week: "週間",
		month: "月間",
		latest: "新着"
	};
	const linkMap = {
		hot: "",
		week: "?term=week",
		month: "?term=month",
		latest: "?term=latest"
	};
	const url = `${baseUrl}?type=${type}`;
	const items = await cache_default.tryGet(url, async () => {
		return processItems(await fetchData(url), "index");
	}, config.cache.routeExpire, false);
	return {
		title: `Skebetter - ${typeMap[type]}`,
		link: `https://skebetter.com/${linkMap[type]}`,
		item: items
	};
}
//#endregion
export { route };
