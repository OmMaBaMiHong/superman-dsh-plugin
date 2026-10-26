import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-Cso4Lj9S.mjs";
import { load } from "cheerio";
//#region lib/routes/everia/search.ts
const route = {
	path: "/search/:keyword",
	categories: ["picture"],
	example: "/everia/search/日向坂46",
	parameters: { keyword: "Keyword" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Search",
	maintainers: ["KTachibanaM", "AiraNadih"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const url = `${SUB_URL}?s=${keyword}`;
	const $ = load((await got_default(url)).body);
	const itemRaw = $("article.post").toArray();
	return {
		title: `${SUB_NAME_PREFIX} - Search: ${keyword}`,
		link: url,
		item: await Promise.all(itemRaw.map((e) => {
			const link = $(e).find("h2.entry-title a").attr("href");
			return cache_default.tryGet(link, () => loadArticle(link));
		}))
	};
}
//#endregion
export { route };
