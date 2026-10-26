import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/qstheory/utils.ts
const baseUrl = "http://www.qstheory.cn";
const getItem = async (item) => {
	const response = await rofetch(item.link);
	const $ = cheerio.load(response);
	$(".fs-text, .fs-pinglun, .hidden-xs").remove();
	item.author = $(".appellation").text();
	item.description = $(".highlight, .text").html() || $(".content").html();
	item.pubDate = parseDate($(".puttime_mobi, .pubtime, .headtitle span").text().trim().replace("发表于", "").replaceAll(/(年|月)/g, "-").replace("日", ""));
	return item;
};
//#endregion
export { getItem as n, baseUrl as t };
