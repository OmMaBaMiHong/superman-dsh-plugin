import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/studygolang/utils.ts
const md = markdownit({
	html: true,
	linkify: true
});
const FetchGoItems = async (ctx, rewriteId) => {
	const id = rewriteId || (ctx.req.param("id") ?? "weekly");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	const rootUrl = "https://studygolang.com";
	const currentUrl = `${rootUrl}/go/${id}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".right-info .title").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: `${rootUrl}${a.attr("href")}`,
			author: item.next().find(".author").text(),
			category: item.next().find(".node").toArray().map((n) => $(n).text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.pubDate = timezone(parseDate(content(".timeago").first().attr("title")), 8);
		try {
			item.description = md.render(content(".content").html());
		} catch {}
		return item;
	})));
	return {
		title: `Go语言中文网 - ${$(".title h2").text()}`,
		link: currentUrl,
		item: items
	};
};
//#endregion
export { FetchGoItems as t };
