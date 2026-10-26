import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/itsc.ts
const route = {
	path: "/itsc",
	categories: ["university"],
	example: "/nju/itsc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["itsc.nju.edu.cn/tzgg/list.htm"] }],
	name: "ITSC 信息中心",
	maintainers: ["ret-1"],
	handler,
	url: "itsc.nju.edu.cn/tzgg/list.htm"
};
async function handler() {
	const category_dict = { tzgg: "通知公告" };
	return {
		title: "ITSC-公告通知",
		link: "https://itsc.nju.edu.cn/tzgg/list.htm",
		item: (await Promise.all(Object.keys(category_dict).map(async () => {
			const data = (await got_default("https://itsc.nju.edu.cn/tzgg/list.htm")).data;
			const $ = load(data);
			const tmp = $(".list2")[0].children;
			const infos = [];
			for (const element of tmp) if (element.children) infos.push(element);
			return infos.map((item) => {
				item = $(item);
				return {
					title: item.find("a").attr("title"),
					description: item.find("a").attr("title"),
					link: "https://itsc.nju.edu.cn" + item.find("a").attr("href"),
					pubDate: timezone(parseDate(item.find(".news_meta").text(), "YYYY-MM-DD"), 8),
					category: category_dict[0]
				};
			});
		})))[0]
	};
}
//#endregion
export { route };
