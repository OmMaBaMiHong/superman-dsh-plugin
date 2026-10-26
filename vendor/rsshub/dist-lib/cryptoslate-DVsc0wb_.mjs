import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/cryptoslate/index.ts
const route = {
	path: "/",
	categories: ["finance"],
	example: "/cryptoslate",
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
		source: ["cryptoslate.com/"],
		target: "/"
	}],
	description: "Get latest news from CryptoSlate."
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const feed = await parser.parseURL("https://cryptoslate.com/feed/");
	const filteredItems = feed.items.filter((item) => !item.link?.includes("/feed") && !item.link?.includes("#respond")).slice(0, limit).map((item) => {
		if (!item.link) return {};
		try {
			const cleanUrl = item.link.split("?", 1)[0];
			return {
				title: item.title || "Untitled",
				link: cleanUrl,
				pubDate: item.pubDate ? parseDate(item.pubDate) : void 0,
				description: extractFullTextFromRSS(item),
				author: item.creator || "CryptoSlate",
				category: item.categories || [],
				guid: item.guid || item.link,
				image: item.enclosure?.url
			};
		} catch (error) {
			logger.warn(`Couldn't process article from CryptoSlate: ${item.link}: ${error.message}`);
			return {};
		}
	}).filter((item) => item && Object.keys(item).length > 0);
	return {
		title: feed.title || "CryptoSlate",
		link: feed.link || "https://cryptoslate.com",
		description: feed.description || "Latest news from CryptoSlate",
		item: filteredItems,
		language: feed.language || "en",
		image: feed.image?.url
	};
}
function extractFullTextFromRSS(entry) {
	try {
		const contentEncoded = entry["content:encoded"] || entry["content:encodedSnippet"] || entry.content || entry.contentSnippet;
		if (!contentEncoded) return null;
		const $ = load(contentEncoded);
		$("img").remove();
		$("figure").remove();
		return $.html() || null;
	} catch (error) {
		logger.error(`Error extracting full text from RSS: ${error}`);
		return null;
	}
}
//#endregion
export { route };
