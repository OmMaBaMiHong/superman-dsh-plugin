import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hinatazaka46/news.ts
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/hinatazaka46/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hinatazaka46.com/s/official/news/list", "hinatazaka46.com/"] }],
	name: "Hinatazaka46 News 日向坂 46 新闻",
	maintainers: ["crispgm", "akashigakki"],
	handler,
	url: "hinatazaka46.com/s/official/news/list"
};
async function handler(ctx) {
	const rootUrl = "https://www.hinatazaka46.com";
	const currentUrl = `${rootUrl}/s/official/news/list`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".p-news__list .p-news__item a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".c-news__text").text(),
			link: `${rootUrl}${item.attr("href").split("?", 1)[0]}`,
			pubDate: parseDate(item.find(".c-news__date").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".p-article__text").html();
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
