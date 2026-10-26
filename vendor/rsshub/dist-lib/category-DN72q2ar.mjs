import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/qbitai/category.ts
const route = {
	path: "/category/:category",
	categories: ["new-media"],
	example: "/qbitai/category/资讯",
	parameters: { category: "分类名，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["qbitai.com/category/:category"] }],
	name: "分类",
	maintainers: ["FuryMartin, Geraldxm"],
	handler,
	description: `| 资讯 | 数码     | 智能车 | 智库  | 活动    |
| ---- | -------- | ------ | ----- | ------- |
| 资讯 | ebandeng | auto   | zhiku | huodong |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const url = encodeURI(`https://www.qbitai.com/category/${category}/feed`);
	const entries = (await parser.parseURL(url)).items.map((item) => ({
		title: item.title,
		pubDate: parseDate(item.pubDate),
		link: item.link,
		author: "量子位",
		category: item.categories,
		description: ""
	}));
	const resolvedEntries = await Promise.all(entries.map((entry) => cache_default.tryGet(entry.link, async () => {
		try {
			entry.description = load(await rofetch(entry.link))(".article").html() || "No content found";
		} catch {
			entry.description = "Failed to fetch content";
		}
		return entry;
	})));
	return {
		title: `量子位 - ${category}`,
		link: `https://www.qbitai.com/category/${category}`,
		item: resolvedEntries
	};
}
//#endregion
export { route };
