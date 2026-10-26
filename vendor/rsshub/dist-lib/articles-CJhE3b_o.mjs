import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/yamap/articles.ts
const baseUrl = "https://yamap.com/activities/";
const host = "https://api.yamap.com/v3/activities?page=1&per=24";
const route = {
	path: "/",
	categories: ["travel"],
	example: "/yamap",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章",
	maintainers: ["valuex"],
	handler,
	description: ""
};
async function handler() {
	const lists = (await got_default(host)).data.activities.map((item) => ({
		title: item.title,
		link: baseUrl + item.id.toString(),
		pubDate: parseDate(item.created_at),
		location: item.map.name || "Japan"
	}));
	const items = await Promise.all(lists.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.title = item.title + "-" + item.location;
		item.description = $("div.ActivitiesId__Body main").html();
		item.pubDate = timezone(parseDate($("span[class=ActivityDetailTabLayout__Middle__Date]").text()), 8);
		return item;
	})));
	return {
		title: "Yamap",
		link: baseUrl,
		description: "Yamap",
		item: items
	};
}
//#endregion
export { route };
