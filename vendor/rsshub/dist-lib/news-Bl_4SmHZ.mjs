import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/casssp/news.ts
const route = {
	path: "/news/:category?",
	categories: ["government"],
	example: "/casssp/news/3",
	parameters: { category: "分类，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究会动态",
	maintainers: ["nczitzk"],
	handler,
	description: `| 通知公告 | 新闻动态 | 信息公开 | 时政要闻 |
| -------- | -------- | -------- | -------- |
| 3        | 2        | 92       | 93       |`
};
async function handler(ctx) {
	const { category = "3" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15;
	const rootUrl = "http://www.casssp.org.cn";
	const currentUrl = new URL(`news/${category}/`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("p.e_text-22.s_title a, p.e_text-18.s_title a").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.prop("href"), rootUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.description = content("div.e_richText-25, div.e_richText-3").html();
		item.pubDate = parseDate(`${content("p.e_timeFormat-15").text()}-${content("p.e_timeFormat-14").text()}-${content("p.e_timeFormat-11").text()}`);
		return item;
	})));
	const image = $("img[la=\"la\"]").first().prop("src");
	const icon = new URL($("link[rel=\"shortcut icon \"]").prop("href"), rootUrl).href;
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image,
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author: $("img[la=\"la\"]").first().prop("title"),
		allowEmpty: true
	};
}
//#endregion
export { route };
