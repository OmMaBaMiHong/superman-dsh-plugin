import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/0818tuan/index.ts
const route = {
	path: "/:listId?",
	categories: ["shopping"],
	example: "/0818tuan",
	parameters: { listId: "活动分类，见下表，默认为 `1`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["TonyRL"],
	handler,
	description: `| 最新线报 | 实测活动 | 优惠券 |
| -------- | -------- | ------ |
| 1        | 2        | 3      |`
};
async function handler(ctx) {
	const baseUrl = "http://www.0818tuan.com";
	const listId = ctx.req.param("listId") || "1";
	const url = `${baseUrl}/list-${listId}-0.html`;
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = $(listId === "3" ? ".col-xs-12 .thumbnail > a" : ".col-md-8 .list-group > a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("title"),
			link: item.attr("href").startsWith("http") ? item.attr("href") : `${baseUrl}${item.attr("href")}`
		};
	}).filter((i) => !i.link.includes("m.0818tuan.com/tb1111.php"));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		$(".pageLink, .alert, p[style=\"margin:15px;\"]").remove();
		item.description = $(".post-content").html();
		item.pubDate = timezone(parseDate($(".panel-body > .text-center").text().replace("时间:", ""), "YYYY-MM-DD HH:mm:ss"), 8);
		return item;
	})));
	return {
		title: $("head title").text(),
		link: url,
		image: "http://www.0818tuan.com/favicon.ico",
		item: items
	};
}
//#endregion
export { route };
