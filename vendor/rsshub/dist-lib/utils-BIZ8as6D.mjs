import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bjnews/utils.ts
function fetchArticle(item) {
	return cache_default.tryGet(item.link, async () => {
		const $d = load(await rofetch(item.link));
		item.pubDate = timezone(parseDate($d(".left-info .timer").text()), 8);
		item.author = $d(".left-info .reporter").text();
		item.description = $d("#contentStr").html();
		return item;
	});
}
//#endregion
export { fetchArticle as t };
