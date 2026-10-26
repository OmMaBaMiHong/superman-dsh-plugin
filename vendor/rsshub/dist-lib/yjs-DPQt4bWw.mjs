import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gzhu/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/gzhu/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm", "yjsy.gzhu.edu.cn/"] }],
	name: "研究生院招生动态",
	maintainers: ["shengmaosu"],
	handler,
	url: "yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm"
};
async function handler() {
	const link = "https://yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".picnews_cont li");
	return {
		title: "广州大学研究生院",
		link,
		description: "广州大学研招网通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("span a");
			return {
				title: a.attr("title"),
				link: new URL(a.attr("href"), link).href,
				pubDate: parseDate(a.text(), "YYYY-MM-DD")
			};
		})
	};
}
//#endregion
export { route };
