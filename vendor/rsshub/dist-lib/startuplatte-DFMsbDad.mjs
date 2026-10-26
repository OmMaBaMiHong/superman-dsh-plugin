import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/startuplatte/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/startuplatte",
	parameters: { category: "分类，见下表，默认为首頁" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["startuplatte.com/category/:category", "startuplatte.com/"] }],
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 首頁 | 大師智慧 | 深度分析 | 新知介紹 |
| ---- | -------- | -------- | -------- |
|      | quote    | analysis | trend    |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const currentUrl = `https://startuplatte.com${category ? `/category/${category}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".post-header h2 a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		content(".wp-post-navigation").remove();
		item.category = content(".cat").text();
		item.author = content("a[rel=\"author\"]").text();
		item.description = content(".post-entry").html();
		item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2})","dateModified"/)[1]);
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
