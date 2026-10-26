import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xmnn/news.ts
const route = {
	path: "/news/:category{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { category = "xmxw" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "https://news.xmnn.cn";
	const currentUrl = new URL(`${category}/`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("div#sort_body ul li a").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h1").text().trim(),
			link: item.prop("href"),
			description: item.find("div.abstract").html(),
			author: item.find("div.source").text(),
			pubDate: timezone(parseDate(item.find("div.time").text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.title = content("div.cont-h, div.tip h1").text().trim();
		item.description = content("div.TRS_Editor").html();
		item.author = content("span.cont-a-src a").toArray().map((a) => content(a).text());
		item.pubDate = timezone(parseDate(content("span.time, div.pubtime div.w").contents().first().text().trim()), 8);
		return item;
	})));
	const title = $("title").text();
	const icon = new URL($("link[rel=\"icon\"]").prop("href"), rootUrl).href;
	return {
		item: items,
		title,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh",
		icon,
		logo: icon,
		subtitle: $("div.h").text(),
		author: title.split(/_/).pop()
	};
}
//#endregion
export { route };
