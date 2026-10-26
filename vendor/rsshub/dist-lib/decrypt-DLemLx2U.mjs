import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/decrypt/index.ts
const route = {
	path: "/",
	categories: ["finance"],
	example: "/decrypt",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["pseudoyu"],
	handler,
	radar: [{
		source: ["decrypt.co/"],
		target: "/"
	}],
	description: "Get latest news from Decrypt."
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const feed = await parser.parseURL("https://decrypt.co/feed");
	const items = await Promise.all(feed.items.filter((item) => item && item.link && !item.link.includes("/videos")).slice(0, limit).map((item) => cache_default.tryGet(`decrypt:article:${item.link}`, async () => {
		if (!item.link) return {};
		try {
			const result = await extractFullText(item.link);
			return {
				title: item.title || "Untitled",
				link: item.link.split("?", 1)[0],
				pubDate: item.pubDate ? parseDate(item.pubDate) : void 0,
				description: result?.fullText ?? (item.content || ""),
				author: item.creator || "Decrypt",
				category: result?.tags ? [.../* @__PURE__ */ new Set([...item.categories ?? [], ...result.tags])] : item.categories || [],
				guid: item.guid || item.link,
				image: result?.featuredImage ?? item.enclosure?.url
			};
		} catch (error) {
			logger.warn(`Couldn't fetch full content for ${item.link}: ${error.message}`);
			return {
				title: item.title || "Untitled",
				link: item.link.split("?", 1)[0],
				pubDate: item.pubDate ? parseDate(item.pubDate) : void 0,
				description: item.content || "",
				author: item.creator || "Decrypt",
				category: item.categories || [],
				guid: item.guid || item.link,
				image: item.enclosure?.url
			};
		}
	})));
	return {
		title: feed.title || "Decrypt",
		link: feed.link || "https://decrypt.co",
		description: feed.description || "Latest news from Decrypt",
		item: items,
		language: feed.language || "en",
		image: feed.image?.url
	};
}
async function extractFullText(url) {
	try {
		const $ = load(await rofetch(url));
		const post = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.post;
		if (post.content.length) return {
			fullText: `<img src="${post.featuredImage.src}" alt="${post.featuredImage.alt}">` + post.content,
			featuredImage: post.featuredImage.src,
			tags: post.tags.data.map((tag) => tag.name)
		};
		return null;
	} catch (error) {
		logger.error(`Error extracting full text from ${url}: ${error}`);
		return null;
	}
}
//#endregion
export { route };
