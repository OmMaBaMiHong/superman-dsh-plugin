import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ahjzu/news.ts
const route = {
	path: "/news",
	categories: ["university"],
	example: "/ahjzu/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.ahjzu.edu.cn/20/list.htm"] }],
	name: "通知公告",
	maintainers: ["Yuk-0v0"],
	handler,
	url: "news.ahjzu.edu.cn/20/list.htm"
};
async function handler() {
	const rootUrl = "https://www.ahjzu.edu.cn";
	const currentUrl = "https://www.ahjzu.edu.cn/20/list.htm";
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $("#wp_news_w9").find("li").toArray().map((item) => {
		item = $(item);
		const date = item.find(".column-news-date").text();
		const a = item.find("a").attr("href");
		const link = a.slice(0, 4) === "http" ? a : rootUrl + a;
		return {
			title: item.find("a").attr("title"),
			link,
			pubDate: timezone(parseDate(date), 8)
		};
	});
	return {
		title: "安建大-通知公告",
		description: "安徽建筑大学-通知公告",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load((await got_default({
				method: "get",
				url: item.link
			})).data)(".wp_articlecontent").html();
			return item;
		})))
	};
}
//#endregion
export { route };
