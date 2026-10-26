import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/topys/index.ts
const route = {
	path: "/:keyword?",
	categories: ["new-media"],
	example: "/topys",
	parameters: { keyword: "关键字，可在对应结果页的 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["topys.cn/search/:keyword", "topys.cn/"] }],
	name: "关键字",
	maintainers: ["nczitzk"],
	handler,
	description: `| 创意 | 设计 | 商业 | 艺术 | 文化 | 科技 |
| ---- | ---- | ---- | ---- | ---- | ---- |`
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword") ?? "";
	const rootUrl = "https://www.topys.cn";
	const currentUrl = `${rootUrl}${keyword ? `/search/${keyword}` : "/api/web/article/get_article_list"}`;
	const response = keyword ? await got_default({
		method: "get",
		url: currentUrl
	}) : await got_default({
		method: "post",
		url: currentUrl,
		json: {
			istop_time: 0,
			size: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 16
		}
	});
	let items = keyword ? response.data.match(/id:(\d+),title:"(.*?)",keyword:"(.*?)",istop_time:(\d+),thumb/g).map((item) => {
		const matches = item.match(/id:(\d+),title:"(.*)",keyword:"(.*)",istop_time:(\d+),thumb/);
		return {
			title: matches[2],
			category: matches[3].split(","),
			link: `${rootUrl}/article/${matches[1]}`,
			pubDate: parseDate(matches[4] * 1e3)
		};
	}) : response.data.data.map((item) => ({
		title: item.title,
		author: item.editor,
		category: item.keyword.split(","),
		link: `${rootUrl}/article/${item.id}`,
		pubDate: parseDate(item.istop_time * 1e3)
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".article-content").html();
		item.author ??= content(".author-name p").first().text();
		return item;
	})));
	return {
		title: `${keyword ? `${keyword} - ` : ""}TOPYS`,
		link: keyword ? currentUrl : `${rootUrl}/pick`,
		item: items
	};
}
//#endregion
export { route };
