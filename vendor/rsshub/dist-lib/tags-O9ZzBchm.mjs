import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { i as parseArticles, n as enhanceItemsWithSummaries, r as fetchPageHtml, t as BASE_URL } from "./utils-qvfTPido.mjs";
import { load } from "cheerio";
//#region lib/routes/dailypush/tags.ts
const route = {
	path: "/tag/:tag/:sort?",
	categories: ["programming"],
	example: "/dailypush/tag/backend/trending",
	parameters: {
		tag: { description: "Tag name" },
		sort: {
			description: "Sort order: `trending` (default) or `latest`",
			default: "trending",
			options: [{
				value: "trending",
				label: "Trending"
			}, {
				value: "latest",
				label: "Latest"
			}]
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: [
			"dailypush.dev/:tag/trending",
			"dailypush.dev/:tag/latest",
			"dailypush.dev/:tag"
		],
		target: "/tag/:tag/:sort?"
	}],
	name: "Tag",
	maintainers: ["TheGeeKing"],
	handler
};
async function handler(ctx) {
	const { tag, sort = "trending" } = ctx.req.param();
	const url = `${BASE_URL}/${tag}/${sort}`;
	const context = await outPlaywright();
	try {
		const $ = load(await fetchPageHtml(context, url, "article"));
		const items = await enhanceItemsWithSummaries(context, parseArticles($, BASE_URL));
		return {
			title: $("title").text() || `DailyPush - ${tag.charAt(0).toUpperCase() + tag.slice(1)}`,
			link: url,
			item: items
		};
	} finally {
		await context.close();
	}
}
//#endregion
export { route };
