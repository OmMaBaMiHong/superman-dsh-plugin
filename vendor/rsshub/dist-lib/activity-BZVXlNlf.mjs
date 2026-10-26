import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as rootUrl } from "./utils-CBgZTdf5.mjs";
import { load } from "cheerio";
//#region lib/routes/odaily/activity.ts
const route = {
	path: "/activity",
	categories: ["new-media"],
	example: "/odaily/activity",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["0daily.com/activityPage", "0daily.com/"] }],
	name: "活动",
	maintainers: ["nczitzk"],
	handler,
	url: "0daily.com/activityPage"
};
async function handler(ctx) {
	let items = (await got_default({
		method: "get",
		url: `${rootUrl}/service/scheme/group/8?page=1&per_page=${ctx.req.query("limit") ?? 25}`
	})).data.data.items.data.map((item) => ({
		title: item.title,
		link: `${rootUrl}/activity/${item.id}`,
		pubDate: timezone(parseDate(item.published_at), 8)
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data.match(/"content":"(.*)"\}\},"secondaryList":/)[1]);
		content("img").each((_, el) => {
			content(el).attr("src", content(el).attr("src").replaceAll(String.raw`\"`, ""));
		});
		item.description = content.html();
		return item;
	})));
	return {
		title: "活动 - Odaily星球日报",
		link: `${rootUrl}/activityPage`,
		item: items
	};
}
//#endregion
export { route };
