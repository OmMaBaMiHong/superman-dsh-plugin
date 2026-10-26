import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { i as parseArticles, n as enhanceItemsWithSummaries, r as fetchPageHtml, t as BASE_URL } from "./utils-qvfTPido.mjs";
import { load } from "cheerio";
//#region lib/routes/dailypush/all.ts
const route = {
	path: "/:sort?",
	categories: ["programming"],
	example: "/dailypush/latest",
	parameters: { sort: {
		description: "Sort order: `` (trending, default) or `latest`",
		default: "",
		options: [{
			value: "",
			label: "Trending"
		}, {
			value: "latest",
			label: "Latest"
		}]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["dailypush.dev/", "dailypush.dev/latest"],
		target: "/"
	}],
	name: "All",
	maintainers: ["TheGeeKing"],
	handler
};
async function handler(ctx) {
	const { sort = "" } = ctx.req.param();
	const url = sort ? `${BASE_URL}/${sort}` : BASE_URL;
	const context = await outPlaywright();
	try {
		const $ = load(await fetchPageHtml(context, url, "article"));
		const items = await enhanceItemsWithSummaries(context, parseArticles($, BASE_URL));
		return {
			title: $("title").text() || "DailyPush - All",
			link: url,
			item: items
		};
	} finally {
		await context.close();
	}
}
//#endregion
export { route };
