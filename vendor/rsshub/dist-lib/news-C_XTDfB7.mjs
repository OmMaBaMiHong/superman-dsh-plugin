import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/uw/gix/news.ts
const route = {
	path: "/gix/news/:category",
	categories: ["university"],
	example: "/uw/gix/news/blog",
	parameters: { category: "Blog Type" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gixnetwork.org/news/:category"] }],
	name: "Global Innovation Exchange News",
	maintainers: ["dykderrick"],
	handler,
	description: `| Blog | In The News |
| ---- | ----------- |
| blog | inthenews   |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	let newsURL = "https://gixnetwork.org/news";
	let feedTitle = "UW GIX News - ";
	let listSelector = "body > div.site > div.site-content > div.content-area > main.site-main > ";
	switch (category) {
		case "blog":
			newsURL += "/blog/";
			feedTitle += "Blogs";
			listSelector += "div.blog-wrapper > section.blog-list > article";
			break;
		case "inthenews":
			newsURL += "/inthenews/";
			feedTitle += "In The News";
			listSelector += "div.news-wrapper > section.news-list > article";
			break;
		default: throw new Error(`Unknown category: ${category}`);
	}
	const data = (await got_default(newsURL)).data;
	const $ = load(data);
	const list = $(listSelector).toArray().map((item) => {
		item = $(item);
		const content = item.find("header").find("h2").find("a");
		return {
			time: item.find("header").find("span.h4").text(),
			link: content.attr("href")
		};
	});
	const itemContent = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		item.title = content("header.entry-header").find("h1").text();
		item.description = content("div.entry-content").html();
		item.pubDate = Date.parse(item.time);
		return item;
	})));
	return {
		title: feedTitle,
		link: newsURL,
		item: itemContent
	};
}
//#endregion
export { route };
