import "./types-DNj6Etbg.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { t as fetchArticle } from "./utils-Di-Yubas.mjs";
//#region lib/routes/apnews/rss.ts
const HOME_PAGE = "https://apnews.com";
const route = {
	path: "/rss/:category?",
	categories: ["traditional-media"],
	example: "/apnews/rss/business",
	view: 0,
	parameters: { category: {
		description: "Category from the first segment of the corresponding site, or `index` for the front page.",
		default: "index"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["apnews.com/:rss"],
		target: "/rss/:rss"
	}],
	name: "News",
	maintainers: [
		"zoenglinghou",
		"mjysci",
		"TonyRL"
	],
	handler
};
async function handler(ctx) {
	const { rss = "index" } = ctx.req.param();
	const url = `${HOME_PAGE}/${rss}.rss`;
	const res = await parser.parseURL(url);
	const items = ctx.req.query("fulltext") === "true" ? await Promise.all(res.items.map((item) => fetchArticle(item))) : res;
	return {
		...res,
		item: items
	};
}
//#endregion
export { route };
