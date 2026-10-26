import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/ss/common.ts
const baseUrl = "https://www.ss.pku.edu.cn";
const getSingleRecord = async (url) => {
	const $ = load((await got_default(url)).data);
	return $("#info-list-ul").find("li").toArray().map((item) => {
		item = $(item);
		const date = item.find(".time").text();
		return {
			title: item.find("a").attr("title"),
			pubDate: parseDate(date),
			link: baseUrl + item.find("a").attr("href")
		};
	});
};
const getArticle = (item) => cache_default.tryGet(item.link, async () => {
	item.description = load((await got_default(item.link)).data)(".article-content").html();
	return item;
});
//#endregion
export { getArticle as n, getSingleRecord as r, baseUrl as t };
