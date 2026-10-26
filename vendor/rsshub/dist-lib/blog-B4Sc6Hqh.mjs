import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/warp/blog.ts
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/warp/blog",
	url: "warp.dev",
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
		source: ["www.warp.dev"],
		target: "/blog"
	}],
	name: "Blog",
	maintainers: ["cscnk52"],
	handler,
	description: "Provides a better reading experience (full articles) over the official ones.",
	view: 5
};
async function handler() {
	const feed = await parser.parseURL("https://www.warp.dev/blog/rss.xml");
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const main = load(await rofetch(item.link))("main");
		main.find("style").remove();
		main.find("[style]").removeAttr("style");
		main.find("[class]").removeAttr("class");
		main.find("[id]").removeAttr("id");
		main.find("[preload]").removeAttr("preload");
		main.find("script").remove();
		main.find("figcaption").remove();
		main.find("section").first().find("div").first().remove();
		item.content = main.html();
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
