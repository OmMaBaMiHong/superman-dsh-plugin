import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/jseea/news.ts
const baseUrl = "https://www.jseea.cn";
const siteTitle = " - 江苏省教育考试院";
async function loadContent(link) {
	const { data: response } = await got_default(link);
	const $ = load(response);
	$("strong").remove();
	return $("#content").html();
}
const route = {
	path: "/news/:type?",
	radar: [{
		source: ["jseea.cn/webfile/news/:type"],
		target: "/news/:type"
	}],
	name: "Unknown",
	maintainers: ["schen1024"],
	handler
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "zkyw";
	const listPageUrl = `${baseUrl}/webfile/news/${type}/`;
	const { data: response } = await got_default(listPageUrl);
	const $ = load(response);
	const list = $("div.content-list-div ul li a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.contents().filter((_, e) => e.nodeType === 3).text().trim(),
			link: `https:${item.attr("href")}`,
			pubDate: timezone(parseDate(item.find("span").text(), "YYYY-MM-DD"), 8)
		};
	});
	const result = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = await loadContent(item.link);
		return item;
	})));
	return {
		title: $("head title").text() + siteTitle,
		link: listPageUrl,
		item: result
	};
}
//#endregion
export { route };
