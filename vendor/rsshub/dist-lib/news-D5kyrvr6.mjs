import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as cookieJar, r as getArticle, t as baseUrl } from "./utils-8wIE3g81.mjs";
import { load } from "cheerio";
//#region lib/routes/nature/news.ts
const route = {
	path: "/news",
	categories: ["journal"],
	example: "/nature/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: true
	},
	radar: [{ source: [
		"nature.com/latest-news",
		"nature.com/news",
		"nature.com/"
	] }],
	name: "Nature News",
	maintainers: ["y9c", "TonyRL"],
	handler,
	url: "nature.com/latest-news"
};
async function handler() {
	const url = `${baseUrl}/latest-news`;
	const $ = load((await got_default(url, { cookieJar })).data);
	let items = $(".c-article-item__content").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h3").text(),
			link: baseUrl + item.find("a").attr("href"),
			pubDate: parseDate(item.find(".c-article-item__date").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, () => getArticle(item))));
	return {
		title: "Nature | Latest News",
		description: $("meta[name=description]").attr("content"),
		link: url,
		item: items
	};
}
//#endregion
export { route };
