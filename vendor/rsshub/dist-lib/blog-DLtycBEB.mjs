import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/deepmind/blog.ts
const route = {
	path: "/blog",
	categories: ["new-media"],
	example: "/deepmind/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["deepmind.com/blog", "deepmind.com/"] }],
	name: "Blog",
	maintainers: ["nczitzk", "TonyRL"],
	handler,
	url: "deepmind.com/blog"
};
async function handler() {
	const feed = await parser.parseURL("https://www.deepmind.com/blog/rss.xml");
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.link);
		item.description = load(data)(".e_container .c_rich-text__cms").html();
		delete item.content;
		delete item.contentSnippet;
		delete item.isoDate;
		return item;
	})));
	return {
		title: feed.title,
		description: feed.description,
		image: "https://assets-global.website-files.com/621d30e84caf0be3291dbf1c/621d336835a91420c6a8dcf2_webclip.png",
		link: `${feed.link}/blog`,
		item: items,
		language: "en"
	};
}
//#endregion
export { route };
