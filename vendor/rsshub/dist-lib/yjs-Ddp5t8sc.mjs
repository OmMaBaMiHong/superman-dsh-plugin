import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ccnu/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/ccnu/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gs.ccnu.edu.cn/zsgz/ssyjs.htm", "gs.ccnu.edu.cn/"] }],
	name: "研究生通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "gs.ccnu.edu.cn/zsgz/ssyjs.htm"
};
async function handler() {
	const link = "http://gs.ccnu.edu.cn/zsgz/ssyjs.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".main-zyrx li");
	return {
		title: "华中师范大学研究生院",
		link,
		description: "华中师范大学研究生院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.attr("title"),
				link: new URL(a.attr("href"), link).href,
				pubDate: parseDate(item.find("small").text(), "YYYY-MM-DD")
			};
		})
	};
}
//#endregion
export { route };
