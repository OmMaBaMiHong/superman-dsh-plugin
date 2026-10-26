import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ngocn2/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/ngocn2",
	parameters: { category: "分类，见下表，默认为所有文章" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ngocn2.org/"] }],
	name: "首页",
	maintainers: ["nczitzk"],
	handler,
	url: "ngocn2.org/",
	description: `| 所有文章 | 早报        | 热点     |
| -------- | ----------- | -------- |
| article  | daily-brief | trending |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "article";
	const rootUrl = "https://ngocn2.org";
	const currentUrl = `${rootUrl}/${category}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".articleroll__article a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".title").text(),
			link: `${rootUrl}${item.attr("href")}`,
			pubDate: parseDate(item.find(".meta").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".gatsby-resp-image-link").each((_, el) => {
			content(el).html(`<img src="${content(el).find("img").attr("src")}">`);
		});
		item.description = content(".article__content").html();
		return item;
	})));
	return {
		title: `${$(".sectitle__content").text()} - NGOCN`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
