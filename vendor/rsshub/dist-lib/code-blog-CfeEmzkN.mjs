import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/visualstudio/code-blog.ts
const route = {
	path: "/code/blog",
	categories: ["programming"],
	example: "/visualstudio/code/blog",
	url: "code.visualstudio.com",
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
		source: ["code.visualstudio.com/"],
		target: "/code/blog"
	}],
	name: "Code Blog",
	maintainers: ["cscnk52"],
	handler,
	description: "Provides a better reading experience (full articles) over the official ones.",
	view: 5
};
async function handler() {
	const feed = await parser.parseURL("https://code.visualstudio.com/feed.xml");
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		$("main h1").first().remove();
		$("main p").first().remove();
		item.content = $("main").html();
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
