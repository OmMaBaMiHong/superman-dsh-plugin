import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scnu/ss.ts
const route = {
	path: "/ss",
	categories: ["university"],
	example: "/scnu/ss",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ss.scnu.edu.cn/tongzhigonggao", "ss.scnu.edu.cn/"] }],
	name: "软件学院通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "ss.scnu.edu.cn/tongzhigonggao"
};
async function handler() {
	const link = "http://ss.scnu.edu.cn/tongzhigonggao/";
	const $ = load((await got_default(link)).data);
	const list = $(".listshow li a");
	return {
		title: "华南师范大学软件学院",
		link,
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.contents().filter((_, node) => node.type === "text").text(),
				link: item.attr("href"),
				pubDate: parseDate(item.find(".time").text())
			};
		})
	};
}
//#endregion
export { route };
