import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/hqjt.ts
const route = {
	path: "/hqjt",
	categories: ["university"],
	example: "/nju/hqjt",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["webplus.nju.edu.cn/_s25/main.psp"] }],
	name: "后勤集团",
	maintainers: ["ret-1"],
	handler,
	url: "webplus.nju.edu.cn/_s25/main.psp"
};
async function handler() {
	const category_dict = { zbcg: "招标采购" };
	return {
		title: "后勤集团-招标采购",
		link: "https://webplus.nju.edu.cn/_s25/zbcg/list.psp",
		item: [...(await Promise.all(Object.keys(category_dict).map(async () => {
			const data = (await got_default("https://webplus.nju.edu.cn/_s25/zbcg/list.psp")).data;
			const $ = load(data);
			return $("li.news").map((index, item) => {
				item = $(item);
				return {
					title: item.find("a").attr("title"),
					link: "https://webplus.nju.edu.cn" + item.find("a").attr("href"),
					pubDate: timezone(parseDate(item.find("span").last().text(), "YYYY-MM-DD"), 8),
					category: category_dict[0]
				};
			});
		})))[0]]
	};
}
//#endregion
export { route };
