import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cosplaytele/article.ts
const loadArticle = async (link) => {
	const article = load((await got_default(link)).body);
	return {
		title: article("h1.entry-title").text().trim(),
		description: article(".entry-content").html() ?? "",
		pubDate: parseDate(article("time")[0].attribs.datetime),
		link
	};
};
//#endregion
//#region lib/routes/cosplaytele/const.ts
const SUB_NAME_PREFIX = "CosplayTele";
const SUB_URL = "https://cosplaytele.com/";
//#endregion
export { SUB_URL as n, loadArticle as r, SUB_NAME_PREFIX as t };
