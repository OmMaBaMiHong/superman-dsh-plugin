import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-YP52tWGY.mjs";
import { load } from "cheerio";
//#region lib/routes/pts/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://news.pts.org.tw${getSubPath(ctx) === "/" ? "/dailynews" : getSubPath(ctx)}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("h1 a,h2 a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).toArray().map((item) => {
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
		item.author = content(".reporter-container a").toArray().map((e) => ({ name: content(e).text() }));
		item.pubDate = timezone(parseDate(content(".article-time .mr-2 time").text()), 8);
		item.updated = timezone(parseDate(content(".article-time span:nth-child(2) time").text()), 8);
		item.category = content(".tag-list").first().find(".blue-tag").toArray().map((t) => content(t).text()).filter((t) => t !== "...");
		item.description = renderDescription({
			image: content("meta[property=\"og:image\"]").attr("content"),
			description: content(".post-article").html()
		});
		return item;
	})));
	return {
		title: $("title").text().replace(/第\d+頁 ｜ /, ""),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
