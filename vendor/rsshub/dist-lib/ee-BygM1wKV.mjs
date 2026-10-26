import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/ee.ts
const route = {
	path: "/ee/:id?",
	categories: ["university"],
	example: "/xjtu/ee/1114",
	parameters: { id: "栏目id，默认请求`1124`，可在 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ee.xjtu.edu.cn/"] }],
	name: "电气学院",
	maintainers: ["DylanXie123"],
	handler,
	url: "ee.xjtu.edu.cn/"
};
async function handler(ctx) {
	const rootUrl = `http://ee.xjtu.edu.cn/list.jsp?urltype=tree.TreeTempUrl&wbtreeid=${ctx.req.param("id") ?? "1124"}`;
	const baseUrl = "http://ee.xjtu.edu.cn";
	const $ = load((await got_default(rootUrl)).data);
	const feed_title = $("span.windowstyle67278", "div[class='list_right fr']").text().trim();
	const list = $("div[class='list_right fr'] ul li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const date = parseDate(item.find("span").text());
		return {
			title: a.text(),
			link: new URL(a.attr("href"), baseUrl).href,
			pubDate: timezone(date, 8)
		};
	});
	return {
		title: `西安交通大学电气学院 - ${feed_title}`,
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default(item.link)).data);
			item.title = content("tr td[class^=titlestyle]").text();
			item.description = content("td.contentstyle67362", "form").html();
			return item;
		})))
	};
}
//#endregion
export { route };
