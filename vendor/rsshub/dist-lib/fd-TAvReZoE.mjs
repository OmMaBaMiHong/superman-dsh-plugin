import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/bjx/fd.ts
const route = {
	path: "/fd/:type",
	categories: ["traditional-media"],
	example: "/bjx/fd/yw",
	parameters: { type: "文章分类，详见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "风电",
	maintainers: ["hualiong"],
	description: `\`:type\` 类型可选如下

| 要闻 | 政策 | 数据 | 市场 | 企业 | 招标 | 技术 | 报道 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| yw   | zc   | sj   | sc   | mq   | zb   | js   | bd   |`,
	handler: async (ctx) => {
		const type = ctx.req.param("type");
		const $ = load(await rofetch(`https://fd.bjx.com.cn/${type}/`));
		const typeName = $("div.box2 em:last-child").text();
		const list = $("div.cc-list-content ul li:nth-child(-n+20)").toArray().map((item) => {
			const each = $(item);
			return {
				title: each.find("a").attr("title"),
				link: each.find("a").attr("href"),
				pubDate: parseDate(each.find("span").text())
			};
		});
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link))("#article_cont").html();
			return item;
		})));
		return {
			title: `北极星风力发电网${typeName}`,
			description: $("meta[name=\"Description\"]").attr("content"),
			link: `https://fd.bjx.com.cn/${type}/`,
			item: items
		};
	}
};
//#endregion
export { route };
