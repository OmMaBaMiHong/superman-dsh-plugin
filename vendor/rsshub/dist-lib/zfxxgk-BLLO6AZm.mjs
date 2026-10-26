import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/ndrc/zfxxgk.ts
const handler = async (ctx) => {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	const currentUrl = new URL("web/dirlist.jsp", "https://zfxxgk.ndrc.gov.cn").href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const language = $("html").prop("lang");
	$("th").parent().remove();
	let items = $("div.zwxxkg-result tr").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("a.xxgk_list1");
		return {
			title: a.text(),
			pubDate: parseDate(item.find("td").last().text()),
			link: new URL(a.prop("href"), currentUrl).href,
			language
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const $$ = load(detailResponse);
		const title = $$("meta[name=\"ArticleTitle\"]").prop("content");
		const description = $$("div.zwgkdetail").html();
		item.title = title;
		item.description = description;
		item.category = [.../* @__PURE__ */ new Set([
			$$("meta[name=\"ContentSource\"]").prop("content"),
			$$("meta[name=\"ColumnName\"]").prop("content"),
			$$("meta[name=\"ColumnType\"]").prop("content")
		])].filter(Boolean);
		item.author = $$("meta[name=\"ContentSource\"]").prop("content");
		item.content = {
			html: description,
			text: $$("div.article").text()
		};
		item.language = language;
		item.enclosure_url = $$("table.enclosure a.xxgk_list1").length === 0 ? void 0 : new URL($$("table.enclosure a.xxgk_list1").first().prop("href"), currentUrl).href;
		item.enclosure_title = item.enclosure_url ? $$("table.enclosure a.xxgk_list1").first().text() : void 0;
		return item;
	})));
	const image = new URL($("div.zwgklogo img").prop("src"), currentUrl).href;
	return {
		title: `${$("meta[name=\"SiteName\"]").prop("content")} - ${$("div.zwgktoptitle").text()}`,
		description: $("meta[name=\"ColumnDescription\"]").prop("content"),
		link: currentUrl,
		item: items,
		allowEmpty: true,
		image,
		author: $("meta[name=\"SiteName\"]").prop("content"),
		language
	};
};
const route = {
	path: "/zfxxgk",
	name: "政府信息公开",
	url: "zfxxgk.ndrc.gov.cn",
	maintainers: ["howfool", "nczitzk"],
	handler,
	example: "/gov/ndrc/zfxxgk",
	parameters: void 0,
	description: void 0,
	categories: ["government"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["zfxxgk.ndrc.gov.cn/web/dirlist.jsp"],
		target: "/zfxxgk"
	}]
};
//#endregion
export { handler, route };
