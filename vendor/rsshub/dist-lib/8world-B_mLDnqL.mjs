import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/8world/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const path = getSubPath(ctx) === "/" ? "/realtime" : getSubPath(ctx);
	const rootUrl = "https://www.8world.com";
	const currentUrl = `${rootUrl}${path}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("div[data-column=\"Two-Third\"] .article-title .article-link").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".text-long").html();
		item.title = content("meta[name=\"cXenseParse:mdc-title\"]").attr("content");
		item.author = content("meta[name=\"cXenseParse:author\"]").attr("content");
		item.pubDate = parseDate(content("meta[name=\"cXenseParse:recs:publishtime\"]").attr("content"));
		item.category = content("meta[name=\"cXenseParse:mdc-keywords\"]").toArray().map((keyword) => content(keyword).attr("content"));
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
