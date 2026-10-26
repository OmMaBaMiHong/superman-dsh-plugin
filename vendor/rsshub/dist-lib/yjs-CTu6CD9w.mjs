import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ecust/gschool/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/ecust/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gschool.ecust.edu.cn/12753/list.htm", "gschool.ecust.edu.cn/"] }],
	name: "研究生院通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "gschool.ecust.edu.cn/12753/list.htm"
};
async function handler() {
	const baseUrl = "https://gschool.ecust.edu.cn";
	const link = `${baseUrl}/12753/list.htm`;
	const $ = load((await got_default(link)).data);
	const list = $("#wp_news_w6 li");
	return {
		title: "华东理工大学研究生院",
		link,
		description: "华东理工大学研究生院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").attr("title"),
				link: `${baseUrl}${item.find("a").attr("href")}`,
				pubDate: parseDate(item.find(".news_meta").text())
			};
		})
	};
}
//#endregion
export { route };
