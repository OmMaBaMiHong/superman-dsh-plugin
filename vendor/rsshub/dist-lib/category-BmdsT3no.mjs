import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as fetchDataItemCached } from "./fetcher-BuozIgik.mjs";
import { load } from "cheerio";
//#region lib/routes/yystv/category.ts
const route = {
	path: "/category/:category",
	categories: ["game"],
	example: "/yystv/category/recommend",
	parameters: { category: "专栏类型" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "游研社 - 分类文章",
	maintainers: ["betta-cyber", "dousha"],
	handler,
	description: `| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 | 业界     |
| --------- | ------- | ------ | ------- | ---- | -------- | -------- |
| recommend | history | big    | culture | news | retro    | industry |`
};
function getDescription(items) {
	return Promise.all(items.map((item) => fetchDataItemCached(item.link, (pageContent) => {
		const articleContent = load(pageContent)(".doc-content.rel").html() || "";
		return {
			...item,
			description: articleContent
		};
	})));
}
async function handler(ctx) {
	const category = ctx.req.param("category");
	const $ = load(await rofetch(`https://www.yystv.cn/b/${category}`));
	const firstPart = $(".b-list-main-item").toArray().map((element) => {
		const s = $(element);
		return {
			title: s.find(".b-main-info-title").text(),
			link: "https://www.yystv.cn" + s.find(".b-main-info-title a").attr("href"),
			pubDate: parseRelativeDate(s.find(".b-main-createtime").text()),
			author: s.find(".b-author").text()
		};
	});
	const secondPart = $(".list-container li").toArray().map((element) => {
		const s = $(element);
		const articleDate = s.find(".c-999").text();
		return {
			title: s.find(".list-article-title").text(),
			link: "https://www.yystv.cn" + s.find("a").attr("href"),
			pubDate: articleDate.includes("-") ? parseDate(articleDate) : parseRelativeDate(articleDate),
			author: s.find(".handler-author-link").text()
		};
	});
	const items = await getDescription([...firstPart, ...secondPart]);
	return {
		title: "游研社-" + $("title").text(),
		link: `https://www.yystv.cn/b/${category}`,
		item: items
	};
}
//#endregion
export { route };
