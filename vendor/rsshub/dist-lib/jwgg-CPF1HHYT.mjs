import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cdu/jwgg.ts
const route = {
	path: "/jwgg",
	categories: ["university"],
	example: "/cdu/jwgg",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jw.cdu.edu.cn/"] }],
	name: "教务处通知公告",
	maintainers: ["uuwor"],
	handler,
	url: "jw.cdu.edu.cn/"
};
async function handler() {
	const url = "https://jw.cdu.edu.cn/jwgg.htm";
	const data = (await got_default.get(url)).data;
	const $ = load(data);
	const list = $(".ListTable.dataTable.no-footer tbody tr[role=\"row\"].odd").slice(0, 10).toArray().map((e) => {
		const element = $(e);
		const title = element.find("tr.odd a").text().trim();
		const link = element.find("tr.odd a").attr("href");
		const pubDate = timezone(parseDate(element.find("tr.odd td.columnDate").text().match(/\d{4}-\d{2}-\d{2}/)), 8);
		return {
			title,
			link: "https://jw.cdu.edu.cn/" + link,
			author: "成都大学教务处通知公告",
			pubDate
		};
	});
	return {
		title: "成大教务处通知公告",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const data = (await got_default.get(item.link)).data;
			item.description = load(data)(".v_news_content").html();
			return item;
		})))
	};
}
//#endregion
export { route };
