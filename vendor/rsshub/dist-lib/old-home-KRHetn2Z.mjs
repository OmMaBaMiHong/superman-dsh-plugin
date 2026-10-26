import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ProcessFeed } from "./utils-DfVWtVzE.mjs";
//#region lib/routes/lfsyd/old-home.ts
const route = {
	path: "/old_home",
	categories: ["game"],
	example: "/lfsyd/old_home",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.iyingdi.com/"] }],
	name: "首页（旧版）",
	maintainers: ["auto-bot-ty"],
	handler,
	url: "www.iyingdi.com/"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ?? 10;
	const rootUrl = "https://www.iyingdi.com";
	const { data } = await got_default(`${rootUrl}/feed/list/user/v3?feedIdUp=0&feedIdDown=0&hotfeed=1&system=web`);
	return {
		title: "旅法师营地 - 首页资讯（旧版）",
		link: rootUrl,
		item: await ProcessFeed(cache_default, data.feeds.slice(0, limit).map((element) => ({
			title: element.feed.title,
			pubDate: parseDate(element.feed.created * 1e3),
			link: `${rootUrl}/tz/post/${element.feed.sourceID}`,
			guid: element.feed.title,
			postId: element.feed.sourceID
		})).filter((item) => item.title !== void 0))
	};
}
//#endregion
export { route };
