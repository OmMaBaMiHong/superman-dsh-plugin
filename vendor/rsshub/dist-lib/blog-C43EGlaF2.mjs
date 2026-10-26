import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/zed/blog.ts
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/zed/blog",
	url: "zed.dev",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["zed.dev"],
		target: "/blog"
	}],
	name: "Blog",
	maintainers: ["cscnk52"],
	handler,
	description: "Provides a better reading experience (full articles) over the official ones.",
	view: 5
};
async function handler() {
	const feed = await parser.parseURL("https://zed.dev/blog.rss");
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const article = load(await rofetch(item.link))("article");
		article.find("style").remove();
		article.find("[style]").removeAttr("style");
		article.find("[class]").removeAttr("class");
		article.find("[id]").removeAttr("id");
		article.find("[preload]").removeAttr("preload");
		article.find("script").remove();
		article.find("figcaption").remove();
		article.find("aside").remove();
		item.content = article.html();
		return {
			title: item.title,
			link: item.link,
			description: item.content,
			pubDate: item.pubDate,
			author: item.creator
		};
	})));
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		item: items,
		language: "en"
	};
}
//#endregion
export { route };
