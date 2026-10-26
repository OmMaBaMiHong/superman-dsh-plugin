import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ccnu/wu.ts
const route = {
	path: "/wu",
	categories: ["university"],
	example: "/ccnu/wu",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["uowji.ccnu.edu.cn/xwzx/tzgg.htm", "uowji.ccnu.edu.cn/"] }],
	name: "伍论贡学院",
	maintainers: ["shengmaosu"],
	handler,
	url: "uowji.ccnu.edu.cn/xwzx/tzgg.htm"
};
async function handler() {
	const link = "http://uowji.ccnu.edu.cn/tzgg.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".zy-mainxrx li");
	return {
		title: "华中师范大学伍论贡学院",
		link,
		description: "华中师范大学伍论贡学院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.text(),
				link: new URL(a.attr("href"), link).href,
				pubDate: parseDate(item.find("small").text(), "YYYY-MM-DD")
			};
		})
	};
}
//#endregion
export { route };
