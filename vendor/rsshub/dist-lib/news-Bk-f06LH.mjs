import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/whitehouse/news.ts
const route = {
	path: "/news/:category?",
	categories: ["government"],
	example: "/whitehouse/news",
	parameters: { category: "Category, see below, all by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["whitehouse.gov/:category", "whitehouse.gov/"],
		target: "/news/:category"
	}],
	name: "News",
	maintainers: ["nczitzk", "hkamran80"],
	handler,
	description: `| All | Articles | Briefings and Statements | Presidential Actions | Remarks |
| --- | -------- | ------------------------ | -------------------- | ------- |
|     | articles | briefings-statements     | presidential-actions | remarks |`
};
async function handler(ctx) {
	const currentUrl = `https://www.whitehouse.gov/${ctx.req.param("category") ?? "news"}/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".post").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.text(),
			link: a.attr("href"),
			pubDate: parseDate(item.find("time").attr("datetime")),
			category: [item.find("a[rel^=tag]").first().text()]
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		$(".wp-block-whitehouse-topper").remove();
		item.description = $(".entry-content").html();
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
