import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/chinamine-safety/util.ts
const rootUrl = "https://www.chinamine-safety.gov.cn";
/**
* Process the item list and return the resulting array.
*
* @param {Object[]} items - The items to process.
* @returns {Promise<Object[]>} - A promise that resolves to an array of processed items.
*/
const processItems = async (items) => await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
	if (!item.link.endsWith("html")) return item;
	const { data: detailResponse } = await got_default(item.link);
	const content = load(detailResponse);
	item.title ||= content("title").text();
	item.description = content("div.TRS_Editor, div.TRS_UEDITOR, div.content").html();
	item.author = content("meta[name=\"ContentSource\"]").prop("content");
	item.category = [...new Set([
		...content("meta[name=\"keywords\"]").prop("content")?.split(/,/) ?? [],
		content("meta[name=\"ColumnName\"]").prop("content"),
		...content("meta[name=\"ColumnKeywords\"]").prop("content")?.split(/,/) ?? [],
		content("meta[name=\"ColumnType\"]").prop("content")
	].filter(Boolean))];
	item.pubDate = timezone(parseDate(content("meta[name=\"PubDate\"]").prop("content")), 8);
	return item;
})));
/**
* Fetch data from the specified URL.
*
* @param {cheerio.CheerioAPI} $ - The cheerio.CheerioAPI.
* @param {string} url - The URL to fetch data from.
* @returns {Promise<Object>} A promise that resolves to an object containing the fetched data
*                            to be added into `ctx.state.data`.
*/
const fetchData = ($, currentUrl) => {
	const image = new URL("zfxxgk/images/P020210105557462473306.png", rootUrl).href;
	const icon = new URL($("link[rel=\"shortcut icon\"]").prop("href"), currentUrl).href;
	return {
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"ColumnDescription\"]").prop("content") || $("meta[name=\"Description\"]").prop("content"),
		language: "zh",
		image,
		icon,
		logo: icon,
		subtitle: $("meta[name=\"ColumnName\"]").prop("content"),
		author: $("meta[name=\"SiteName\"]").prop("content")
	};
};
//#endregion
export { processItems as n, rootUrl as r, fetchData as t };
