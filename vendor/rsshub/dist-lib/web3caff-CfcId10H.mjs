import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/web3caff/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://web3caff.com${getSubPath(ctx) === "/" ? "" : getSubPath(ctx)}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".list-grouped").first().find(".list-body").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10).toArray().map((item) => {
		item = $(item);
		const a = item.find(".list-title");
		return {
			title: a.text(),
			link: a.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".ss-inline-share-wrapper").remove();
		item.description = content(".post-content").html();
		item.author = content(".author-name .author-popup").text();
		item.category = content("a[rel=\"category tag\"]").toArray().map((tag) => $(tag).text());
		item.pubDate = parseDate(content("meta[property=\"article:published_time\"]").attr("content"));
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
