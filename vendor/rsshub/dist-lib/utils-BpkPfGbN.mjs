import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/woshipm/utils.ts
const baseUrl = "https://www.woshipm.com";
const parseArticle = (item) => cache_default.tryGet(item.link, async () => {
	const { data: response } = await got_default(item.link);
	const $ = load(response);
	$(".support-author").remove();
	item.description = $(".article--content").html();
	return item;
});
//#endregion
export { parseArticle as n, baseUrl as t };
