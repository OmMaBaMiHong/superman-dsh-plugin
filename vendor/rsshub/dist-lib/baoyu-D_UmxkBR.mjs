import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/baoyu/index.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/baoyu/blog",
	radar: [{ source: ["baoyu.io/"] }],
	url: "baoyu.io/",
	name: "Blog",
	maintainers: ["liyaozhong", "Circloud"],
	handler,
	description: "宝玉 - 博客文章"
};
async function handler() {
	const rootUrl = "https://baoyu.io";
	const response = await rofetch(`${rootUrl}/feed.xml`);
	const feed = await parser.parseString(response);
	return {
		title: "宝玉的博客",
		link: rootUrl,
		item: await Promise.all(feed.items.map((item) => {
			const link = item.link;
			return cache_default.tryGet(link, async () => {
				const content = load(await rofetch(link))(".container").find(".prose").html() || "";
				return {
					title: item.title,
					description: content,
					link,
					pubDate: item.pubDate ? parseDate(item.pubDate) : void 0,
					author: item.creator || "宝玉"
				};
			});
		}))
	};
}
//#endregion
export { route };
