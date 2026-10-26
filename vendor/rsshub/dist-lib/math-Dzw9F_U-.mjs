import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getPageItemAndDate } from "./utils-BoqNULgv.mjs";
import { load } from "cheerio";
//#region lib/routes/jsu/math.ts
const route = {
	path: "/stxy",
	categories: ["university"],
	example: "/jsu/stxy",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "数学与统计学院 - 通知公告",
	maintainers: ["wenjia03"],
	handler
};
async function handler() {
	const baseUrl = "https://stxy.jsu.edu.cn/";
	const $ = load((await got_default({
		method: "get",
		url: "https://stxy.jsu.edu.cn/index/tzgg1.htm"
	})).data);
	const list = $("div.art_list").toArray();
	return {
		title: "吉首大学数学与统计学院 - 通知公告",
		link: "https://stxy.jsu.edu.cn/index/tzgg1.htm",
		description: "吉首大学数学与统计学院 - 通知公告",
		item: await Promise.all(list.map((item) => {
			item = $(item);
			const link = new URL(item.find("a").attr("href"), baseUrl).href;
			return cache_default.tryGet(link, async () => {
				const description = await getPageItemAndDate("#right_con > form > div.articleInfo", link, "#right_con > form > div.articleTitle", "#right_con > form > div.articleAuthor > span:nth-child(1)");
				const pubDate = parseDate(description.date, "YYYY年MM月DD日 HH:mm");
				return {
					title: description.title,
					link,
					pubDate,
					description: description.pageInfo,
					category: "通知公告"
				};
			});
		}))
	};
}
//#endregion
export { route };
