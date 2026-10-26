import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/supchina/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["supchina.com/feed", "supchina.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "supchina.com/feed"
};
async function handler(ctx) {
	const rootUrl = "https://supchina.com";
	const $ = load((await got_default({
		method: "get",
		url: `${rootUrl}/feed/`
	})).data);
	let items = $("item").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).toArray().map((item) => {
		item = $(item);
		return {
			guid: item.find("guid").text(),
			title: item.find("title").text(),
			link: item.find("guid").text(),
			author: item.find(String.raw`dc\:creator`).html().match(/CDATA\[(.*?)\]/)[1],
			category: item.find("category").toArray().map((c) => $(c).html().match(/CDATA\[(.*?)\]/)[1]),
			pubDate: parseDate(item.find("pubDate").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".aspect-spacer, .post-recs, .author-bio").remove();
		item.description = content(".post__main").html();
		return item;
	})));
	return {
		title: $("title").first().text(),
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
