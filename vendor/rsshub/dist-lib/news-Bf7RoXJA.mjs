import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dorohedoro/news.ts
const route = {
	path: "/news",
	categories: ["game"],
	example: "/dorohedoro/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dorohedoro.net/news", "dorohedoro.net/"] }],
	name: "News",
	maintainers: ["nczitzk"],
	handler,
	url: "dorohedoro.net/news"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25;
	const rootUrl = "https://dorohedoro.net";
	const apiUrl = `${rootUrl}/news/news.xml`;
	const currentUrl = `${rootUrl}/news/`;
	const $ = load((await got_default({
		method: "get",
		url: apiUrl
	})).data, { xmlMode: true });
	let items = $("item").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const link = item.find("permalink").text();
		const isNews = /news_\d+_\d+\.html/.test(link);
		return {
			title: item.find("title").text(),
			pubDate: parseDate(item.find("date").text()),
			link: `${rootUrl}${isNews ? `/news/${link}` : ""}`,
			isNews
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.isNews) try {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			content("#bk_btn").remove();
			item.title = content(".newsTitle").text();
			item.description = content("article").html();
		} catch {}
		delete item.isNews;
		return item;
	})));
	return {
		title: "アニメ『ドロヘドロ』",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
