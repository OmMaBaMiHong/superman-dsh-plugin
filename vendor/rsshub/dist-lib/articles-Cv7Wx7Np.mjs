import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import Parser from "rss-parser";
//#region lib/routes/ntrblog/articles.ts
const parser = new Parser({ customFields: { item: ["issued"] } });
const route = {
	path: "/articles",
	categories: ["anime"],
	example: "/ntrblog/articles",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Articles",
	maintainers: ["keocheung"],
	radar: [{ source: ["ntrblog.com"] }],
	handler
};
async function handler() {
	const rsp = await got_default("https://ntrblog.com/atom.xml");
	const feed = await parser.parseString(rsp.data);
	const items = await Promise.all(feed.items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			const content = load(response)("div.article-body");
			content.find("#twitter-widget-1").remove();
			content.find("[id^=\"ldblog_related_articles_\"]").remove();
			content.find("#ad2").remove();
			item.content = `<div lang="ja">${content.html()}</div>`;
			return item;
		});
	}));
	return {
		title: feed.title || "NTR BLOG（寝取られブログ）",
		link: feed.link || "https://ntrblog.com",
		description: feed.description || "NTR BLOG（寝取られブログ）最新文章",
		image: feed.image?.url,
		item: items.map((item) => ({
			title: item.title || "",
			link: item.link || "",
			author: item.author || "",
			pubDate: item.issued ? new Date(item.issued) : void 0,
			description: item.content || "",
			image: item.enclosure?.url,
			guid: item.guid
		})),
		language: "ja"
	};
}
//#endregion
export { route };
