import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/p-articles/utils.ts
const rootUrl = "https://p-articles.com";
const ProcessFeed = (info, data) => {
	const $ = load(data);
	info.author = $("div.detail_title_02 > h4 > a:nth-child(2)").text().trim();
	info.pubDate = timezone(parseDate($("div.detail_title_02 > h4 ").text().trim()), 8);
	info.description = $("div.detail_contect_01").html();
	return info;
};
//#endregion
export { rootUrl as n, ProcessFeed as t };
