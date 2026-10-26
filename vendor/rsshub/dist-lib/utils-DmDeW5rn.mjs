import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/mirrormedia/utils.ts
function getArticle(item) {
	return cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link));
		item.description = item.link.includes("external") ? content(":is([class^=external-article-brief],[class^=external-article-content])").html() : content(":is([class^=brief__BriefContainer],[class^=article-content__Wrapper])").html();
		item.category = [...item.category, ...(content("meta[name='keywords']").attr("content") ?? "").split(",")];
		return item;
	});
}
//#endregion
export { getArticle as t };
