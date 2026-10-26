import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wikinews/index.ts
const currentURL = "https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85";
const route = {
	path: "/latest",
	categories: ["new-media"],
	example: "/wikinews/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zh.wikinews.org/wiki/Special:新闻订阅"] }],
	name: "最新新闻",
	maintainers: ["KotoriK"],
	handler,
	description: "根据维基新闻的[sitemap](https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85)获取新闻全文。目前仅支持中文维基新闻。"
};
async function handler() {
	const $ = load((await got_default(currentURL)).data);
	const urls = $("url").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(String.raw`news\:title`).text(),
			pubDate: parseDate(item.find(String.raw`news\:publication_date`).text()),
			category: item.find(String.raw`news\:keywords`).text().split(",").map((item) => item.trim()),
			link: item.find("loc").text()
		};
	});
	const items = await Promise.all(urls.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("#bodyContent").html();
		return item;
	})));
	return {
		title: "最新新闻 - 维基新闻",
		link: currentURL,
		item: items
	};
}
//#endregion
export { route };
