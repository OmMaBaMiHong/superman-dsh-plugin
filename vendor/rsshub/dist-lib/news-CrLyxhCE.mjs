import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/diandong/news.ts
const rootUrl = "https://webapi.diandong.com";
const titleMap = {
	0: "推荐",
	29: "新车",
	61: "导购",
	30: "试驾",
	75: "用车",
	22: "技术",
	24: "政策",
	23: "行业"
};
const route = {
	path: "/news/:cate?",
	categories: ["new-media"],
	example: "/diandong/news",
	parameters: { cate: "分类，见下表，默认为推荐" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["diandong.com/news"],
		target: "/news/:cate"
	}],
	name: "资讯",
	maintainers: ["Fatpandac"],
	handler,
	url: "diandong.com/news",
	description: `分类

| 推荐 | 新车 | 导购 | 试驾 | 用车 | 技术 | 政策 | 行业 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 29   | 61   | 30   | 75   | 22   | 24   | 23   |`
};
async function handler(ctx) {
	const cate = ctx.req.param("cate") ?? 0;
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 25;
	const list = (await got_default(`${rootUrl}/content/list?page=1&size=${limit}&source_id=12&content_type=news&content_ids=&category_id=${cate}`)).data.data.list.map((item) => ({
		title: item.title,
		pubDate: parseDate(item.published),
		author: item.author,
		link: `https://www.diandong.com/news/${item.contentid}.html`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("#gallery-selector").html();
		return item;
	})));
	return {
		title: `电动邦 - ${titleMap[cate]}`,
		link: "https://www.diandong.com/news",
		item: items
	};
}
//#endregion
export { route };
