import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ouc/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/ouc/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yz.ouc.edu.cn/5926/list.htm"] }],
	name: "研究生院",
	maintainers: ["shengmaosu"],
	handler,
	url: "yz.ouc.edu.cn/5926/list.htm"
};
async function handler() {
	const link = "https://yz.ouc.edu.cn/5926/list.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".wp_article_list li");
	return {
		title: "中国海洋大学研究生院",
		link,
		description: "中国海洋大学研究生院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.attr("title"),
				link: new URL(a.attr("href"), link).href,
				pubDate: parseDate(item.find(".Article_PublishDate").text())
			};
		})
	};
}
//#endregion
export { route };
