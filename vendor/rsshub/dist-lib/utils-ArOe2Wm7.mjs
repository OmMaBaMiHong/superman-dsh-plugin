import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sobooks/utils.ts
const utils = async (ctx, currentUrl) => {
	currentUrl = `https://www.sobooks.net/${currentUrl}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".card-item h3 a").slice(0, 15).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".e-secret, .article-social").remove();
		item.description = content(".article-content").html();
		item.pubDate = parseDate(content(".bookinfo ul li").eq(4).text().replace("时间：", ""));
		return item;
	})));
	return {
		title: ($(".archive-header h1").text() ? $(".archive-header h1").text() + " - " : "") + "SoBooks",
		link: currentUrl,
		item: items
	};
};
//#endregion
export { utils as t };
