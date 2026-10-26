import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tangshufang/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/tangshufang",
	parameters: { category: "分类，见下表，默认为首页" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["tangshufang.com/:category", "tangshufang.com/"] }],
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 首页 | 老唐实盘 | 书房拾遗 | 理念 & 估值 | 经典陪读 | 财务套利 |
| ---- | -------- | -------- | ----------- | -------- | -------- |
|      | shipan   | wenda    | linian      | peidu    | taoli    |

| 企业分析 | 白酒企业 | 腾讯控股 | 分众传媒 | 海康威视 | 其他企业 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| qiye     | baijiu   | tengxun  | fenzhong | haikang  | qita     |

| 核心五篇 | 读者投稿 | 读书随笔 | 财报浅析 | 出行游记 | 巴芒连载 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| hexin    | tougao   | suibi    | caibao   | youji    | bamang   |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10;
	const currentUrl = `https://www.tangshufang.com${category ? `/${category}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("article").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("h2 a");
		return {
			title: a.text(),
			link: a.attr("href"),
			pubDate: parseDate(item.find("time").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".wxsyncmain").html();
		item.category = content("a[rel=\"category tag\"]").toArray().map((a) => content(a).text());
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
