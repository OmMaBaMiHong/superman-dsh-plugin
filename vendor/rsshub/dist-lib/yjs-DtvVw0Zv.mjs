import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scut/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/scut/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www2.scut.edu.cn/graduate/14562/list.htm"] }],
	name: "研究生院通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "www2.scut.edu.cn/graduate/14562/list.htm"
};
async function handler() {
	const baseUrl = "https://www2.scut.edu.cn";
	const link = `${baseUrl}/graduate/14562/list.htm`;
	const $ = load((await got_default(link)).data);
	const list = $("#wp_news_w4 a");
	return {
		title: "华南理工大学研究生院",
		link,
		description: "华南理工大学研究生院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.contents().filter((_, node) => node.type === "text").text(),
				link: `${baseUrl}${item.attr("href")}`,
				pubDate: parseDate(item.find("span").text())
			};
		})
	};
}
//#endregion
export { route };
