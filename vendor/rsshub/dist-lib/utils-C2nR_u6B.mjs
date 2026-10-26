import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/coindesk/utils.ts
const parseItem = async (item) => {
	const $ = load(await rofetch(item.link));
	const ldJson = JSON.parse($("script[type=\"application/ld+json\"]").text());
	$(".article-ad, #strategy-rules-player-wrapper, [data-module-name=\"newsletter-article-sign-up-module\"], div.flex.flex-col.gap-2").remove();
	const cover = $(".article-content-wrapper figure");
	cover.find("img").attr("src", cover.find("img").attr("url")?.split("?", 1)[0]);
	cover.find("img").removeAttr("style srcset url");
	item.description = cover.parent().html() + $(".document-body").toArray().map((item) => $(item).html()).join("");
	item.pubDate = parseDate(ldJson.datePublished);
	item.author = ldJson.author.map((a) => ({ name: a.name }));
	item.image = ldJson.image.url.split("?", 1)[0];
	return item;
};
//#endregion
export { parseItem as t };
