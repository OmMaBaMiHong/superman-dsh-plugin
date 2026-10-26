import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/blockworks/index.ts
const route = {
	path: "/",
	categories: ["finance"],
	example: "/blockworks",
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
		source: ["blockworks.co/"],
		target: "/"
	}],
	name: "News",
	maintainers: ["pseudoyu"],
	handler,
	description: "Blockworks news with full text support."
};
async function handler(ctx) {
	const feed = await parser.parseURL("https://blockworks.co/feed");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const limitedItems = feed.items.slice(0, limit);
	const buildId = await getBuildId();
	const items = await Promise.all(limitedItems.map((item) => ({
		...item,
		link: item.link?.split("?", 1)[0]
	})).map((item) => cache_default.tryGet(item.link, async () => {
		const content = await extractFullText(item.link.split("/").pop(), buildId);
		return {
			title: item.title || "Untitled",
			pubDate: item.isoDate ? parseDate(item.isoDate) : void 0,
			link: item.link,
			description: content.description || item.content || item.contentSnippet || item.summary || "",
			author: item.author,
			category: content.category,
			media: content.imageUrl ? { content: { url: content.imageUrl } } : void 0
		};
	})));
	return {
		title: feed.title || "Blockworks News",
		link: feed.link || "https://blockworks.co",
		description: feed.description || "Latest news from Blockworks",
		item: items,
		language: feed.language || "en"
	};
}
async function extractFullText(slug, buildId) {
	try {
		const article = (await rofetch(`https://blockworks.co/_next/data/${buildId}/news/${slug}.json?slug=${slug}`)).pageProps.article;
		const $ = load(article.content, null, false);
		$("hr").remove();
		$("p > em, p > strong").each((_, el) => {
			const $el = $(el);
			if ($el.text().includes("To read full editions") || $el.text().includes("Get the news in your inbox")) $el.parent().remove();
		});
		$("ul.wp-block-list > li > a").each((_, el) => {
			const $el = $(el);
			if ($el.attr("href") === "https://blockworks.co/newsletter/daily") $el.parent().parent().remove();
		});
		return {
			description: $.html(),
			imageUrl: article.imageUrl,
			category: [.../* @__PURE__ */ new Set([...article.categories, ...article.tags])]
		};
	} catch (error) {
		logger.error("Error extracting full text from Blockworks:", error);
		return {
			description: "",
			imageUrl: "",
			category: []
		};
	}
}
const getBuildId = () => cache_default.tryGet("blockworks:buildId", async () => {
	return load(await rofetch("https://blockworks.co"))("script#__NEXT_DATA__").text()?.match(/"buildId":"(.*?)",/)?.[1] || "";
}, config.cache.routeExpire, false);
//#endregion
export { route };
