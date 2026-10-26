import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/sara/index.ts
const typeMap = {
	dynamic: "协会动态",
	announcement: "通知公告",
	industry: "行业动态"
};
const route = {
	path: "/:type",
	categories: ["government"],
	example: "/sara/announcement",
	parameters: { type: "dynamic | announcement | industry" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	description: `| 协会动态 | 通知公告     | 行业动态 |
| -------- | ------------ | -------- |
| dynamic  | announcement | industry |`,
	name: "新闻资讯",
	maintainers: ["HChenZi"],
	handler: async (ctx) => {
		const baseUrl = "http://www.sara.org.cn";
		const type = ctx.req.param("type");
		const url = `${baseUrl}/news/${type}.htm`;
		const $ = load(await rofetch(url));
		const list = $(".newsItem_total > dd").toArray().map((item) => {
			const a = $(item).find("a").first();
			return {
				link: `${baseUrl}${a.attr("href")}`,
				title: a.attr("title")
			};
		});
		const items = await Promise.all(list.map((elem) => getFeedItem(elem)));
		return {
			title: typeMap[type],
			link: url,
			item: items
		};
	}
};
async function getFeedItem(item) {
	return await cache_default.tryGet(item.link, async () => {
		return {
			description: load(await rofetch(item.link))(".text").html(),
			language: "zh-cn",
			...item
		};
	});
}
//#endregion
export { route };
