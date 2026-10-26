import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bast/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const colPath = getSubPath(ctx).replace(/^\//, "") || "32942";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	const currentUrl = `https://www.bast.net.cn/${Number.isNaN(colPath) ? colPath : `col/col${colPath}`}/`;
	let $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".list-title-bif").remove();
	const title = $("title").text();
	let selection = $("a[title]");
	if (selection.length === 0) {
		$ = load($("ul.cont-list div script").first().text());
		$(".list-title-bif").remove();
		selection = $("a[title]");
	}
	let items = selection.slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text().trim(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (/bast\.net\.cn/.test(item.link)) {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			item.title = content("meta[name=\"ArticleTitle\"]").attr("content");
			item.author = content("meta[name=\"contentSource\"]").attr("content");
			item.pubDate = timezone(parseDate(content("meta[name=\"pubdate\"]").attr("content")), 8);
			item.category = [content("meta[name=\"ColumnName\"]").attr("content")];
			item.description = content(".arccont").html();
		}
		return item;
	})));
	return {
		title,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
