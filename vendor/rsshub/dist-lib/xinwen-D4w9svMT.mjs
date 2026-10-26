import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/byau/xinwen/index.ts
const route = {
	path: "/news/:type_id",
	categories: ["university"],
	example: "/byau/news/3674",
	parameters: { type_id: "栏目类型(从菜单栏获取对应 ID)" },
	radar: [{
		source: ["xinwen.byau.edu.cn/:type_id/list.htm"],
		target: "/news/:type_id"
	}],
	name: "新闻网",
	maintainers: ["ueiu"],
	handler,
	url: "xinwen.byau.edu.cn",
	description: `| 学校要闻 | 校园动态 |
| -------- | -------- |
| 3674     | 3676     |`
};
async function handler(ctx) {
	const baseUrl = "http://xinwen.byau.edu.cn/";
	const url = `${baseUrl}${ctx.req.param("type_id")}/list.htm`;
	const $ = load((await got_default(url)).data);
	const list = $(".news").toArray().map((item) => {
		const $$ = load(item);
		const originalItemUrl = $$("a").attr("href");
		const itemUrl = originalItemUrl.startsWith("http") ? originalItemUrl : new URL(originalItemUrl, baseUrl).href;
		return {
			title: $$("a").text(),
			link: itemUrl,
			pubDate: timezone(parseDate($$(".news_meta").text()), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)(".col_news_con").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: url,
		item: items
	};
}
//#endregion
export { route };
