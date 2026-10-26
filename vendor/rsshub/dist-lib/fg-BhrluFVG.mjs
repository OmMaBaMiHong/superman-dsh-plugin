import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/suzhou/fg.ts
const route = {
	path: "/fg/:category{.+}?",
	name: "发展和改革委员会",
	example: "/gov/suzhou/fg/szfgw/ggl/nav_list",
	parameters: { category: "分类，见下表，默认为通知公告" },
	radar: [{
		source: ["fg.suzhou.gov.cn/*category"],
		target: "/fg/:category"
	}],
	maintainers: ["nczitzk"],
	handler,
	description: `| 通知公告            | 发改要闻             |
| ------------------- | -------------------- |
| szfgw/ggl/nav\\_list | szfgw/gzdt/nav\\_list |`
};
async function handler(ctx) {
	const { category = "szfgw/ggl/nav_list" } = ctx.req.param();
	const categoryPath = category.replace(/\.shtml$/, "");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "https://fg.suzhou.gov.cn";
	const currentUrl = new URL(`${categoryPath}.shtml`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("h4 a[title]").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.prop("title") || item.text(),
			link: new URL(item.prop("href"), rootUrl).href,
			author: item.find(".author").text(),
			pubDate: parseDate(item.parent().find("span.time").text().trim())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.title = content("ucaptitle").text().trim();
		item.description = content("ucapcontent").html();
		item.author = content("span.ly b").text().trim();
		item.pubDate = timezone(parseDate(content("meta[name=\"PubDate\"]").prop("content")), 8);
		return item;
	})));
	const author = $("meta[name=\"SiteName\"]").prop("content");
	const subtitle = $("meta[name=\"ColumnName\"]").prop("content");
	const image = new URL($("div.logo img").prop("src"), rootUrl).href;
	return {
		item: items,
		title: `${author} - ${subtitle}`,
		link: currentUrl,
		description: $("meta[name=\"ColumnDescription\"]").prop("content"),
		language: $("html").prop("lang"),
		image,
		subtitle,
		author
	};
}
//#endregion
export { route };
