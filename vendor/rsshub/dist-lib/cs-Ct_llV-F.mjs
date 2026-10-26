import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ccnu/cs.ts
const route = {
	path: "/cs",
	categories: ["university"],
	example: "/ccnu/cs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cs.ccnu.edu.cn/xwzx/tzgg.htm", "cs.ccnu.edu.cn/"] }],
	name: "计算机学院",
	maintainers: ["shengmaosu"],
	handler,
	url: "cs.ccnu.edu.cn/xwzx/tzgg.htm"
};
async function handler() {
	const link = "http://cs.ccnu.edu.cn/xwzx/tzgg.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".list_box_07 li");
	return {
		title: "华中师范大学计算机学院",
		link,
		description: "华中师范大学计算机学院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.attr("title"),
				description: item.find(".overfloat-dot-2").text(),
				link: new URL(a.attr("href"), link).href,
				pubDate: parseDate(item.find(".time").text(), "DDYYYY-MM")
			};
		})
	};
}
//#endregion
export { route };
