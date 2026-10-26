import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sakurazaka46/news.ts
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/sakurazaka46/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sakurazaka46.com/s/s46/news/list", "sakurazaka46.com/"] }],
	name: "Sakurazaka46 News 櫻坂 46 新闻",
	maintainers: ["nczitzk"],
	handler,
	url: "sakurazaka46.com/s/s46/news/list"
};
async function handler(ctx) {
	const rootUrl = "https://sakurazaka46.com";
	const currentUrl = `${rootUrl}/s/s46/news/list`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".com-news-part .box a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".lead").text(),
			link: `${rootUrl}${item.attr("href").split("?", 1)[0]}`,
			pubDate: parseDate(item.find(".date").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".article").html();
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
