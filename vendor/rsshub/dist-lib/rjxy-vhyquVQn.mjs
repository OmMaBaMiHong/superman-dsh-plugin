import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getPageItemAndDate } from "./utils-BoqNULgv.mjs";
import { load } from "cheerio";
//#region lib/routes/jsu/rjxy.ts
const route = {
	path: "/rjxy",
	categories: ["university"],
	example: "/jsu/rjxy",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "计算机科学与工程学院 - 通知公告",
	maintainers: ["wenjia03"],
	handler
};
async function handler() {
	const baseUrl = "https://rjxy.jsu.edu.cn/";
	const $ = load((await got_default({
		method: "get",
		url: "https://rjxy.jsu.edu.cn/index/tzgg1.htm"
	})).data);
	const list = $("body > div.list-box > div > ul > li").toArray();
	return {
		title: "吉首大学计算机科学与工程学院 - 通知公告",
		link: "https://rjxy.jsu.edu.cn/index/tzgg1.htm",
		description: "吉首大学计算机科学与工程学院 - 通知公告",
		item: await Promise.all(list.map((item) => {
			item = $(item);
			const link = new URL(item.find("a").attr("href"), baseUrl).href;
			return cache_default.tryGet(link, async () => {
				const category = "通知公告";
				const description = await getPageItemAndDate("#vsb_content", link, "body > form > div > h1", "body > form > div > div.label", (date) => date.split("  点击：", 1)[0]);
				const pubDate = parseDate(description.date, "YYYY年MM月DD日 HH:mm");
				return {
					title: description.title,
					link,
					pubDate,
					description: description.pageInfo,
					category
				};
			});
		}))
	};
}
//#endregion
export { route };
