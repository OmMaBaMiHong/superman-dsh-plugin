import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/cointelegraph/index.ts
const route = {
	path: "/",
	categories: ["finance"],
	example: "/cointelegraph",
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
		source: ["cointelegraph.com/"],
		target: "/"
	}],
	description: "Get latest news from Cointelegraph with full text."
};
async function handler() {
	const feed = await parser.parseURL("https://cointelegraph.com/rss");
	const validItems = (await Promise.all(feed.items.filter((item) => item.link && /\/news|\/explained|\/innovation-circle/.test(item.link)).map((item) => ({
		...item,
		link: item.link?.split("?", 1)[0]
	})).map((item) => cache_default.tryGet(item.link, async () => {
		const link = item.link;
		const fullText = await extractFullText(link);
		if (!fullText) logger.warn(`Failed to extract content from ${link}`);
		return {
			title: item.title || "Untitled",
			description: fullText || item.content,
			pubDate: item.pubDate ? parseDate(item.pubDate) : void 0,
			link,
			author: item.creator || "CoinTelegraph",
			category: item.categories?.map((c) => c.trim()) || [],
			image: item.enclosure?.url
		};
	})))).filter((item) => item !== null);
	return {
		title: feed.title || "CoinTelegraph News",
		link: feed.link || "https://cointelegraph.com",
		description: feed.description || "Latest news from CoinTelegraph",
		language: feed.language || "en",
		item: validItems
	};
}
async function extractFullText(url) {
	try {
		const $ = load(await rofetch(url));
		const nuxtData = $("script:contains(\"window.__NUXT__\")").text();
		const fullText = JSON.parse(nuxtData.match(/\.fullText=(".*?");/)?.[1] || "{}");
		const cover = $(".post-cover__image");
		cover.find("source").remove();
		cover.find("img").removeAttr("srcset");
		cover.find("img").attr("src", cover.find("img").attr("src")?.match(/(https:\/\/s3\.cointelegraph\.com\/.+)/)?.[1] || "");
		return cover.html() + fullText || null;
	} catch (error) {
		logger.error(`Error fetching article content: ${error}`);
		return null;
	}
}
//#endregion
export { route };
