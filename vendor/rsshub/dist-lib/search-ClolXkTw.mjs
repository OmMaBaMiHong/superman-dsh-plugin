import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as getOriginUrl, t as getArticleDesc } from "./utils-QiXspzBj.mjs";
import { load } from "cheerio";
//#region lib/routes/jpxgmn/search.ts
const route = {
	path: "/search/:kw",
	categories: ["picture"],
	example: "/jpxgmn/search/candy",
	parameters: { kw: "搜索关键词" },
	name: "搜索",
	maintainers: ["Urabartin"],
	handler,
	features: { nsfw: true }
};
async function handler(ctx) {
	const { kw } = ctx.req.param();
	const searchUrl = await getOriginUrl() + `/plus/search/index.asp?keyword=${kw}`;
	const response = await rofetch.raw(searchUrl);
	const baseUrl = new URL(response.url).origin;
	const $ = load(response._data);
	const items = $("div.list div.list div.node p").toArray().map((item) => ({
		title: $(item).find("b").text(),
		link: new URL($(item).find("a").attr("href"), baseUrl).href,
		pubDate: parseDate($(item).next().next().next().find("span").first().text())
	})).filter((item) => item.title.length !== 0);
	return {
		title: `极品性感美女搜索 - ${kw}`,
		link: response.url,
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = await getArticleDesc(item.link);
			return item;
		})))
	};
}
//#endregion
export { route };
