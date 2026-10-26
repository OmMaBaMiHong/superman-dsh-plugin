import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getPageItemAndDate } from "./utils-BoqNULgv.mjs";
import { load } from "cheerio";
//#region lib/routes/jsu/universityindex.ts
const route = {
	path: "/notice",
	categories: ["university"],
	example: "/jsu/notice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "通知公告",
	maintainers: ["wenjia03"],
	handler
};
async function handler() {
	const baseUrl = "https://www.jsu.edu.cn/";
	const $ = load((await got_default({
		method: "get",
		url: "https://www.jsu.edu.cn/index/tzgg.htm"
	})).data);
	const list = $("body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > div:nth-child(2) > ul > li").toArray();
	return {
		title: "吉首大学 - 通知公告",
		link: "https://www.jsu.edu.cn/index/tzgg.htm",
		description: "吉首大学 - 通知公告",
		item: await Promise.all(list.map((item) => {
			item = $(item);
			const link = new URL(item.find("a").attr("href"), baseUrl).href;
			return cache_default.tryGet(link, async () => {
				const description = await getPageItemAndDate("#vsb_content", link, "body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > form > div > h1", "body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > form > div > div:nth-child(2)", (date) => date.split("时间：", 2)[1].split(" 作者：", 1)[0]);
				const pubDate = parseDate(description.date, "YYYY-MM-DD");
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
