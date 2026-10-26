import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as renderDescription, i as rootUrl, n as apiTopicUrl, r as processItems } from "./util-gOgBfx1c.mjs";
import { load } from "cheerio";
//#region lib/routes/readhub/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/readhub",
	parameters: { category: "分类，见下表，默认为热门话题" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: [
		"WhiteWorld",
		"nczitzk",
		"Fatpandac"
	],
	handler,
	description: `| 热门话题 | 科技动态 | 医疗产业 | 财经快讯           |
| -------- | -------- | -------- | ------------------ |
|          | news     | medical  | financial\\_express |`
};
async function handler(ctx) {
	const { category = "" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const currentUrl = new URL(category ?? "", rootUrl).href;
	const { data: currentResponse } = await got_default(currentUrl);
	const { data: response } = await got_default(apiTopicUrl, { searchParams: {
		type: currentResponse.match(/\[\\"type\\",\\"(\d+)\\",\\"d\\"\]/)?.[1] ?? "1",
		page: 1,
		size: limit
	} });
	let items = response.data.items.slice(0, limit).map((item) => ({
		title: item.title,
		link: item.url ?? new URL(`topic/${item.uid}`, rootUrl).href,
		description: renderDescription({
			description: item.summary,
			news: item.newsAggList,
			timeline: item.timeline,
			rootUrl
		}),
		author: item.siteNameDisplay,
		category: [...item.entityList.map((c) => c.name) ?? [], ...item.tagList.map((c) => c.name) ?? []],
		guid: item.uid,
		pubDate: parseDate(item.publishDate)
	}));
	items = await processItems(items);
	const $ = load(currentResponse);
	const author = $("meta[property=\"og:site_name\"]").prop("content");
	const subtitle = $(`a[data-path="/${category}"]`).text();
	const image = $("link[rel=\"preload\"][as=\"image\"]").prop("href");
	const icon = $("meta[property=\"og:image\"]").prop("content");
	return {
		item: items,
		title: `${author} - ${subtitle}`,
		link: currentUrl,
		description: $("meta[property=\"og:description\"]").prop("content"),
		language: "zh",
		image,
		icon,
		logo: icon,
		subtitle,
		author,
		allowEmpty: true
	};
}
//#endregion
export { route };
