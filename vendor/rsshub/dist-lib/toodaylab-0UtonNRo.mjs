import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/toodaylab/index.ts
const route = {
	path: "/:params{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { params = "posts" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const isHot = params === "hot";
	const rootUrl = "https://www.toodaylab.com";
	const currentUrl = new URL(isHot ? "posts" : params, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = isHot ? $("div.hot-list a").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("div.hot-item p").text(),
			link: new URL(item.prop("href"), rootUrl).href
		};
	}) : $("div.single-post").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("p.title a");
		const pubDate = item.find("div.left-infos p").text().trim().split(/\/\/\s/).pop();
		return {
			title: a.text(),
			link: new URL(a.prop("href"), rootUrl).href,
			description: item.find("p.excerpt").html(),
			author: item.find("div.left-infos p a").text().trim(),
			pubDate: timezone(/[年日月]/.test(pubDate) ? parseDate(pubDate, ["YYYY年M月D日 HH:mm", "M月D日 HH:mm"]) : parseRelativeDate(pubDate), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		const pubDate = content("div.left-infos p").text().trim().split(/\/\/\s/).pop();
		item.title = content("h1").text() || item.title;
		item.description = content("div.post-content").html() ?? item.description;
		item.author = content("div.left-infos p a").text().trim() ?? item.author;
		item.category = content("div.right-infos a").slice(1).toArray().map((c) => content(c).text().replace(/#/, ""));
		item.pubDate ??= timezone(/[年日月]/.test(pubDate) ? parseDate(pubDate, ["YYYY年M月D日 HH:mm", "M月D日 HH:mm"]) : parseRelativeDate(pubDate), 8);
		item.upvotes = content("#like_count").text() ? Number(content("#like_count").text()) : 0;
		item.comments = Number(content("div.right-infos a").first().text()) || 0;
		return item;
	})));
	const title = $("title").text().split(/\s-/, 1)[0];
	const icon = $("link[rel=\"apple-touch-icon\"]").last().prop("href");
	return {
		item: items,
		title: isHot ? title.replace(/[^|]+/, "最热 ") : title,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image: $("h3.logo a img").prop("src"),
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author: $("h3.logo a img").prop("alt")
	};
}
//#endregion
export { route };
