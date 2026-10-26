import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/4khd/article.ts
const processImages = ($) => {
	$("a").each((_, elem) => {
		const $elem = $(elem);
		const largePhotoUrl = $elem.attr("href")?.replace("i0.wp.com", "").replace("pic.4khd.com", "yt4.googleusercontent.com").replace("AsHYQ", "AsYHQ").replace("l/AAA", "I/AAA");
		if (largePhotoUrl) {
			$elem.attr("href", largePhotoUrl);
			$elem.find("img").attr("src", largePhotoUrl);
		}
	});
};
function loadArticle(item) {
	const article = load(item.content.rendered);
	processImages(article);
	return {
		title: item.title.rendered,
		description: article.html() ?? "",
		pubDate: parseDate(item.date_gmt),
		link: item.link
	};
}
//#endregion
//#region lib/routes/4khd/const.ts
const SUB_NAME_PREFIX = "4KHD";
const SUB_URL = "https://www.4khd.com/";
//#endregion
export { SUB_URL as n, loadArticle as r, SUB_NAME_PREFIX as t };
