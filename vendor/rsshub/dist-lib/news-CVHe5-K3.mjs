import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dhu/jiaowu/news.ts
const baseUrl = "https://jw.dhu.edu.cn";
const map = {
	student: "/tzggwxszl/list.htm",
	teacher: "/tzggwjszl/list.htm",
	class: "/tzggwxkzl_19850/list.htm",
	fxzy: "/fxzy/list.htm"
};
const route = {
	path: "/jiaowu/news/:type?",
	categories: ["university"],
	example: "/dhu/jiaowu/news/student",
	parameters: { type: "默认为 `student`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处通知",
	maintainers: ["KiraKiseki"],
	handler,
	description: `| 学生专栏 | 教师专栏 | 选课专栏（仅选课期间开放） | 辅修专业 |
| -------- | -------- | -------------------------- | -------- |
| student  | teacher  | class                      | fxzy     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "student";
	const link = `${baseUrl}${map[type]}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const items = await Promise.all($(".list2 > li").toArray().map(async (item) => {
		item = $(item);
		const newsTitle = item.find(".news_title > a");
		const newsMeta = item.find(".news_meta");
		const link = newsTitle.attr("href");
		const title = newsTitle.text();
		const pubDate = parseDate(newsMeta.text(), "YYYY-MM-DD", "zh-cn");
		const url = `${baseUrl}${link}`;
		return await cache_default.tryGet(url, async () => {
			let description;
			try {
				const { data: response } = await got_default(url);
				description = load(response)(".wp_articlecontent").first().html() ?? "";
			} catch {
				description = "";
			}
			return {
				title,
				link,
				pubDate,
				description
			};
		});
	}));
	return {
		title: "东华大学教务处-" + $(".col_title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };
