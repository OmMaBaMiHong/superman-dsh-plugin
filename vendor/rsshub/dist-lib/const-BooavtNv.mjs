import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/4kup/article.ts
const processLazyImages = ($) => {
	$("a.thumb-photo").each((_, elem) => {
		const $elem = $(elem);
		const largePhotoUrl = $elem.attr("href");
		if (largePhotoUrl) $elem.find("img").attr("src", largePhotoUrl);
	});
	$(".caption").remove();
};
function loadArticle(item) {
	const article = load(item.content.rendered);
	processLazyImages(article);
	return {
		title: item.title.rendered,
		description: article.html() ?? "",
		pubDate: parseDate(item.date_gmt),
		link: item.link
	};
}
//#endregion
//#region lib/routes/4kup/const.ts
const SUB_NAME_PREFIX = "4KUP";
const SUB_URL = "https://4kup.net/";
//#endregion
export { SUB_URL as n, loadArticle as r, SUB_NAME_PREFIX as t };
