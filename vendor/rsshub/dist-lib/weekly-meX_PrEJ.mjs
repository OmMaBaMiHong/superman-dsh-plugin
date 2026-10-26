import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as getOriginUrl, t as getArticleDesc } from "./utils-QiXspzBj.mjs";
import { load } from "cheerio";
//#region lib/routes/jpxgmn/weekly.ts
const route = {
	path: "/weekly",
	categories: ["picture"],
	example: "/jpxgmn/weekly",
	radar: [{
		source: ["mei5.vip/"],
		target: "/weekly"
	}],
	name: "本周热门",
	maintainers: ["Urabartin"],
	handler,
	features: { nsfw: true }
};
async function handler() {
	const response = await rofetch.raw(await getOriginUrl());
	const baseUrl = new URL(response.url).origin;
	const $ = load(response._data);
	const items = $("aside div:nth-child(2) li").toArray().map((item) => {
		const fullTitle = $(item).find("a").attr("title") || "";
		const result = fullTitle.match(/([^.]+)\.\D+([\d-]+)/);
		const ret = {
			title: fullTitle,
			link: new URL($(item).find("a").attr("href"), baseUrl).href
		};
		if (result !== null) {
			ret.title = result[1];
			ret.pubDate = parseDate(result[2]);
		}
		return ret;
	});
	return {
		title: "极品性感美女 - 本周热门推荐",
		link: response.url,
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = await getArticleDesc(item.link);
			return item;
		})))
	};
}
//#endregion
export { route };
