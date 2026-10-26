import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as fetchDataItemCached } from "./fetcher-BuozIgik.mjs";
import { load } from "cheerio";
//#region lib/routes/yystv/docs.ts
const route = {
	path: "/docs",
	categories: ["game"],
	example: "/yystv/docs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yystv.cn/docs"] }],
	name: "游研社 - 全部文章",
	maintainers: ["HaitianLiu", "yy4382"],
	handler,
	url: "yystv.cn/docs"
};
async function handler() {
	const $ = load(await rofetch("https://www.yystv.cn/docs"));
	const itemList = $(".list-container li").toArray().map((item) => {
		const itemElement = $(item);
		return {
			title: itemElement.find(".list-article-title").text(),
			link: "https://www.yystv.cn" + itemElement.find("a").attr("href"),
			pubDate: parseRelativeDate(itemElement.find(".c-999").text()),
			author: itemElement.find(".handler-author-link").text(),
			description: itemElement.find(".list-article-intro").text()
		};
	});
	const items = await Promise.all(itemList.map((item) => fetchDataItemCached(item.link, (articleContent) => {
		item.description = load(articleContent)("#main section.article-section .doc-content > div").html() || item.description;
		return item;
	})));
	return {
		title: "游研社-" + $("title").text(),
		link: "https://www.yystv.cn/docs",
		item: items
	};
}
//#endregion
export { route };
