import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ccf/news.ts
const route = {
	path: "/news/:category?",
	categories: ["study"],
	example: "/ccf/news",
	parameters: { category: "分类，见下表，默认为 CCF 新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ccf.org.cn/:category", "ccf.org.cn/"],
		target: "/news/:category"
	}],
	name: "新闻",
	maintainers: ["nczitzk"],
	handler,
	description: `| CCF 新闻    | CCF 聚焦 | ACM 信息  |
| ----------- | -------- | --------- |
| Media\\_list | Focus    | ACM\\_News |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") || "Media_list";
	const rootUrl = "https://www.ccf.org.cn";
	const currentUrl = `${rootUrl}/${category}/`;
	const $ = load((await got_default(currentUrl)).data);
	const list = $(".tit a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		content(".new_info .num").remove();
		item.description = content(".txt").html();
		item.pubDate = parseDate(content(".new_info span").text());
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
