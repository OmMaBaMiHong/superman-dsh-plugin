import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/xyu/library.ts
const route = {
	path: "/library",
	categories: ["university"],
	example: "/xyu/library",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "图书馆通知公告",
	maintainers: ["JinMokai"],
	handler,
	url: "lib.xyc.edu.cn/index/tzgg.htm",
	radar: [{
		source: ["lib.xyc.edu.cn/index/tzgg.htm"],
		target: "/library"
	}]
};
async function handler() {
	const baseUrl = "https://lib.xyc.edu.cn";
	const url = `${baseUrl}/index/tzgg.htm`;
	const $ = load(await rofetch(url));
	return {
		title: "新余学院图书馆通知公告",
		link: url,
		item: $(".text-list ul li").toArray().map((item) => {
			const $item = $(item);
			const $link = $item.find("a");
			const title = $link.attr("title") || $link.text().trim();
			const relativeUrl = $link.attr("href");
			return {
				title,
				link: relativeUrl ? new URL(relativeUrl, baseUrl).href : "",
				pubDate: parseDate($item.find(".date").text().trim() || $item.text().match(/\d{4}-\d{2}-\d{2}/)?.[0] || "", "YYYY-MM-DD"),
				description: title
			};
		}).filter((item) => Boolean(item.title && item.link))
	};
}
//#endregion
export { route };
