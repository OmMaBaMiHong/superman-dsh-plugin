import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/csdn/blog.ts
const route = {
	path: "/blog/:user",
	categories: ["blog"],
	example: "/csdn/blog/csdngeeknews",
	parameters: { user: "`user` is the username of a CSDN blog which can be found in the url of the home page" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["blog.csdn.net/:user"] }],
	name: "User Feed",
	maintainers: ["Jkker"],
	handler
};
async function handler(ctx) {
	const rssUrl = `https://rss.csdn.net/${ctx.req.param("user")}/rss/map`;
	const feed = await parser.parseURL(rssUrl);
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const description = load((await got_default({
				method: "get",
				url: item.link
			})).data)("#content_views").html();
			return {
				...item,
				description
			};
		} catch {
			return item;
		}
	})));
	return {
		...feed,
		title: `${feed.title} - CSDN博客`,
		item: items
	};
}
//#endregion
export { route };
