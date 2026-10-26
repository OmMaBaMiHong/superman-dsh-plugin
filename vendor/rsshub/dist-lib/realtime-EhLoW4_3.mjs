import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/stheadline/std/realtime.ts
const baseUrl = "https://www.stheadline.com";
const route = {
	path: "/std/:category{.+}?",
	name: "即時",
	maintainers: ["TonyRL"],
	example: "/stheadline/std/realtimenews",
	parameters: { category: "分類路徑，URL 中 `www.stheadline.com/` 後至中文分類名前部分，預設為 `realtimenews`" },
	radar: [{
		source: ["www.stheadline.com/theme/:category/chineseCategory", "www.stheadline.com/:category/:chineseCategory"],
		target: "/std/:category"
	}],
	handler
};
async function handler(ctx) {
	const { category = "realtimenews" } = ctx.req.param();
	const url = `${baseUrl}/${category}`;
	const { data: response } = await got_default(url);
	const $ = load(response);
	let items = $(".news-block .news-detail > a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".title").text(),
			link: new URL(item.attr("href"), "https://www.stheadline.com").href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		return {
			...item,
			description: $(".content-body").html(),
			pubDate: parseDate($("meta[property=\"article:published_time\"]").attr("content")),
			category: $("meta[name='keyword']").attr("content").split(","),
			guid: item.link.slice(0, item.link.lastIndexOf("/"))
		};
	})));
	return {
		title: $("head meta[name=\"title\"]").attr("content") || $("head title").text(),
		description: $("meta[name=description]").attr("content"),
		image: "https://www.sthlstatic.com/sthl/assets/favicon/android-icon-192x192.png",
		language: "zh-HK",
		link: url,
		item: items
	};
}
//#endregion
export { route };
