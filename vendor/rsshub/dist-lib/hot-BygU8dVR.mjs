import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/taiwannews/hot.ts
const route = {
	path: "/hot/:lang?",
	categories: ["traditional-media"],
	example: "/taiwannews/hot",
	parameters: { lang: "Language, `en` or `zh`, `en` by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["taiwannews.com.tw/:lang/index"],
		target: "/hot/:lang"
	}],
	name: "Hot News",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://www.taiwannews.com.tw";
	const { lang = "en" } = ctx.req.param();
	const url = `${baseUrl}/${lang}/index`;
	const $ = load((await got_default(url)).data);
	const list = $(".mod_group-columns  .container-fluid .row").toArray().map((item) => {
		item = $(item);
		const a = item.find(".entry-header a").first();
		return {
			title: a.attr("title"),
			link: new URL(a.attr("href"), baseUrl).href,
			pubDate: timezone(parseDate(item.find(".entry-date span").eq(1).text(), "YYYY/MM/DD HH:mm"), 8)
		};
	}).filter((item) => item.title);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.author = $(".article-author").text();
		item.category = $(".tagcloud a").toArray().map((a) => $(a).attr("title"));
		$(".article-head-wrapper, div[id^=div-gpt-ad-], div[class^=hidden-], footer").remove();
		$(".container-fluid").eq(2).remove();
		item.description = $(".mod_single-column").html();
		return item;
	})));
	return {
		title: `${$(".categories").eq(0).text()} - ${$("head title").text()}`,
		description: $("meta[name=\"description\"]").attr("content"),
		link: url,
		item: items,
		language: lang
	};
}
//#endregion
export { route };
