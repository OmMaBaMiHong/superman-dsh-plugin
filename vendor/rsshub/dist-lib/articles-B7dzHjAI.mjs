import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cmpxchg8b/articles.ts
const baseUrl = "https://lock.cmpxchg8b.com/";
const title = "cmpxchg8b";
const route = {
	path: "/articles",
	categories: ["blog"],
	example: "/cmpxchg8b/articles",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["lock.cmpxchg8b.com/articles"] }],
	name: "Articles",
	maintainers: ["yuguorui"],
	handler,
	url: "lock.cmpxchg8b.com/articles"
};
async function handler() {
	const { data: response } = await got_default(baseUrl);
	const $ = load(response);
	const author = $("p.author").text().trim();
	const list = $("section#articles section").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("li").text(),
			link: new URL(item.find("li a").attr("href"), baseUrl).href,
			author
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const body = load(response)("body");
		body.find("nav, footer").remove();
		item.description = body.html();
		return item;
	})));
	return {
		title,
		link: new URL("#articles", baseUrl).href,
		item: items
	};
}
//#endregion
export { route };
