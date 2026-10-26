import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/upc/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/upc/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zs.gs.upc.edu.cn/sszs/list.htm", "zs.gs.upc.edu.cn/"] }],
	name: "研究生院通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "zs.gs.upc.edu.cn/sszs/list.htm"
};
async function handler() {
	const baseUrl = "http://zs.gs.upc.edu.cn";
	const link = `${baseUrl}/sszs/list.htm`;
	const $ = load((await got_default(link)).data);
	const list = $(".list tr");
	return {
		title: "中国石油大学研究生院",
		link,
		description: "中国石油大学研究生院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.attr("title"),
				link: `${baseUrl}${a.attr("href")}`,
				pubDate: parseDate(item.find("div[style]").text())
			};
		})
	};
}
//#endregion
export { route };
