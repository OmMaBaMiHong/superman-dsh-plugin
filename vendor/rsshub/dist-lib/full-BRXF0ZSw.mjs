import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/economist/full.ts
const getArticleDetail = (link) => cache_default.tryGet(link, async () => {
	const $ = load((await got_default(link)).data);
	$("div.article-audio-player__center-tooltip").remove();
	const nextData = JSON.parse($("head script[type=\"application/ld+json\"]").first().text());
	return {
		article: ($("figure[class^=css-]").first().parent().parent().html() || "") + $("p[data-component=\"paragraph\"]").parent().parent().html(),
		categories: nextData.keywords?.map((k) => k)
	};
});
const route = {
	path: "/:endpoint",
	categories: ["traditional-media"],
	view: 0,
	example: "/economist/latest",
	parameters: { endpoint: "Category name, can be found on the [official page](https://www.economist.com/rss). For example, https://www.economist.com/china/rss.xml to china" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["economist.com/:endpoint"] }],
	name: "Category",
	maintainers: ["ImSingee"],
	handler
};
async function handler(ctx) {
	const endpoint = ctx.req.param("endpoint");
	const feed = await parser.parseURL(`https://www.economist.com/${endpoint}/rss.xml`);
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const items = await Promise.all(feed.items.slice(0, limit).map(async (item) => {
		const path = item.link.slice(item.link.lastIndexOf("/") + 1);
		const isNotCollection = !/^\d{4}-\d{2}-\d{2}$/.test(path);
		const itemDetails = isNotCollection ? await getArticleDetail(item.link) : null;
		return {
			title: item.title,
			description: isNotCollection ? itemDetails.article : item.content,
			link: item.link,
			guid: item.guid,
			pubDate: item.pubDate,
			category: isNotCollection ? itemDetails.categories : null
		};
	}));
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		item: items
	};
}
//#endregion
export { route };
