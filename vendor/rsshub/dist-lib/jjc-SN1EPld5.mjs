import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/jjc.ts
const route = {
	path: "/jjc",
	categories: ["university"],
	example: "/nju/jjc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jjc.nju.edu.cn/main.htm", "jjc.nju.edu.cn/"] }],
	name: "基建处",
	maintainers: ["ret-1"],
	handler,
	url: "jjc.nju.edu.cn/main.htm"
};
async function handler() {
	const category_dict = {
		cgxx: "采购信息",
		cjgg: "成交公告",
		cfgg: "处罚公告"
	};
	const items = await Promise.all(Object.keys(category_dict).map(async (c) => {
		const data = (await got_default(`https://jjc.nju.edu.cn/${c}/list.htm`)).data;
		const $ = load(data);
		return $("#wp_news_w6").children().children().children().map((index, item) => {
			item = $(item);
			return {
				title: item.find("a").attr("title"),
				description: item.find("a").attr("title"),
				link: "https://jjc.nju.edu.cn" + item.find("a").attr("href"),
				pubDate: timezone(parseDate(item.find("td").last().text(), "YYYY-MM-DD"), 8),
				category: category_dict[c]
			};
		});
	}));
	return {
		title: "南京大学基建处",
		link: "https://jjc.nju.edu.cn/main.htm",
		item: [
			...items[0],
			...items[1],
			...items[2]
		]
	};
}
//#endregion
export { route };
