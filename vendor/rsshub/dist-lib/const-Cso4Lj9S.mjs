import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/everia/article.ts
const loadArticle = async (link) => {
	const article = load((await got_default(link)).body);
	return {
		title: article("h2.entry-title").text().trim(),
		description: article(".wp-block-image").toArray().map((element) => article.html(element)).join(""),
		link
	};
};
//#endregion
//#region lib/routes/everia/const.ts
const SUB_NAME_PREFIX = "EVERIA.CLUB";
const SUB_URL = "https://everia.club/";
//#endregion
export { SUB_URL as n, loadArticle as r, SUB_NAME_PREFIX as t };
