import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dhu/yjs/news.ts
const baseUrl = "https://gs.dhu.edu.cn";
const map = {
	trend: "/7205/list.htm",
	notice: "/7206/list.htm",
	class: "/xkks/list.htm"
};
const route = {
	path: "/yjs/news/:type?",
	categories: ["university"],
	example: "/dhu/yjs/news/class",
	parameters: { type: "默认为 `class`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生院通知",
	maintainers: ["fox2049"],
	handler,
	description: `| 新闻动态 | 通知公告 | 选课考试 |
| -------- | -------- | -------- |
| trend    | notice   | class    |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "class";
	const link = `${baseUrl}${map[type]}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".sub_list > li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.attr("title"),
			link: a.attr("href").startsWith("http") ? a.attr("href") : `${baseUrl}${a.attr("href")}`,
			pubDate: parseDate(item.find("span").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)(".wp_articlecontent").first().html();
		return item;
	})));
	return {
		title: "东华大学研究生-" + $(".Column_Name").text(),
		link,
		item: items
	};
}
//#endregion
export { route };
