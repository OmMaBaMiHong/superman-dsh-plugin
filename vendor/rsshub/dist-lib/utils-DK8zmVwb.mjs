import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/agirls/utils.ts
const baseUrl = "https://agirls.aotter.net";
const parseArticle = async (item) => {
	const content = load((await got_default(item.link)).data);
	item.category = [...new Set(content(".ag-article__tag").toArray().map((e) => content(e).text().trim().replace("#", "")))];
	const ldJson = JSON.parse(content("script[type=\"application/ld+json\"]").text());
	item.description = content(".ag-article__content").html();
	item.pubDate = parseDate(ldJson["@graph"][0].datePublished);
	item.updated = parseDate(ldJson["@graph"][0].dateModified);
	item.author = ldJson["@graph"][0].author.map((a) => a.name).join(", ");
	return item;
};
//#endregion
export { parseArticle as n, baseUrl as t };
