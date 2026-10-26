import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/hebei/czt.ts
const route = {
	path: "/czt/xwdt/:category?",
	categories: ["government"],
	example: "/gov/hebei/czt/xwdt",
	parameters: { category: "分类，见下表，默认为财政动态" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "财政厅",
	maintainers: ["nczitzk"],
	handler,
	description: `| 财政动态 | 综合新闻 | 通知公告 |
| -------- | -------- | -------- |
| gzdt     | zhxw     | tzgg     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "gzdt";
	const rootUrl = "http://czt.hebei.gov.cn";
	const currentUrl = `${rootUrl}/xwdt/${category}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("td li a[title]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href").startsWith("../..") ? item.attr("href").replace(/^\.\.\/\.\./, "") : `/xwdt/${category}${item.attr("href").replace(/^\./, "")}`}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.author = content("meta[name=\"ContentSource\"]").attr("content");
		item.pubDate = parseDate(content("meta[name=\"PubDate\"]").attr("content"));
		item.description = content(".TRS_Editor, .content").html();
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
