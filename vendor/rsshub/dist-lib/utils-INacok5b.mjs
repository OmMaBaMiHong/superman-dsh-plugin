import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ruancan/utils.ts
const fetchFeed = async (ctx, currentUrl) => {
	currentUrl = `https://www.ruancan.com${currentUrl}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".item-title a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 15).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".entry-copyright").remove();
		content(".entry-content div").each((_, el) => {
			if (/^ruanc-\d+/.test(content(el).attr("id"))) content(el).remove();
		});
		content("figure").each((_, el) => {
			content(el).html(`<img src="${content(el).find("a").attr("href")}">`);
		});
		item.description = content(".entry-content").html();
		item.category = content(".entry-info a[rel=\"category tag\"]").toArray().map((c) => content(c).text());
		item.pubDate = parseDate(content(".entry-info .entry-date").attr("datetime"));
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
};
//#endregion
export { fetchFeed as t };
