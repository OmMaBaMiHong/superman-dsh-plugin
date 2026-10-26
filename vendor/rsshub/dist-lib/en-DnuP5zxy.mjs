import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/gigazine/en.ts
const ROOT_URL = "https://gigazine.net";
const LIST_URL = `${ROOT_URL}/gsc_news/en/`;
const DEFAULT_LIMIT = 10;
const DETAIL_FETCH_DELAY = 3e3;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getRequestOptions = (referer) => ({ headers: { Referer: referer } });
const getAbsoluteUrl = (path) => path ? new URL(path, ROOT_URL).href : void 0;
const getArticleAuthor = ($) => $("#article .items p").text().match(/Posted by\s+(\S.*)$/)?.[1]?.trim();
const getArticleCategories = ($) => [...new Set($("#article .items p a[href*=\"/gsc_news/en/C\"]").toArray().map((element) => $(element).text().trim()).filter(Boolean))];
const fetchDescription = async (item) => {
	const $ = load(await rofetch(item.link, getRequestOptions(LIST_URL)));
	const content = $("#article .cntimage");
	content.find("script").remove();
	content.find("h1.title, time.yeartime").remove();
	content.find("img").each((_, img) => {
		const src = $(img).attr("src") ?? $(img).attr("data-src");
		if (src) $(img).attr("src", getAbsoluteUrl(src));
		$(img).removeAttr("data-src");
	});
	content.find("a[href]").each((_, anchor) => {
		const href = $(anchor).attr("href");
		if (href) $(anchor).attr("href", getAbsoluteUrl(href));
	});
	item.description = content.html()?.trim() ?? "";
	item.image = getAbsoluteUrl($("meta[property=\"og:image\"]").attr("content")) ?? item.image;
	item.author = getArticleAuthor($) ?? item.author;
	const categories = getArticleCategories($);
	item.category = categories.length > 0 ? categories : item.category;
	return item;
};
const route = {
	path: "/en",
	categories: ["new-media"],
	view: 0,
	example: "/gigazine/en",
	name: "English News",
	url: "gigazine.net/gsc_news/en/",
	maintainers: ["chansantheman"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["gigazine.net/gsc_news/en/", "gigazine.net/gsc_news/en"],
		target: "/en"
	}],
	handler,
	description: "Full-text English articles from GIGAZINE. Detail pages are cached, and the common `limit` parameter controls how many recent entries are fetched."
};
async function handler(ctx) {
	const limit = Number(ctx.req.query("limit")) || DEFAULT_LIMIT;
	const $ = load(await rofetch(LIST_URL, getRequestOptions(ROOT_URL)));
	const items = await pMap($(".card").toArray().map((el) => {
		const card = $(el);
		const anchor = card.find("h2 a");
		const path = anchor.attr("href");
		const link = path ? new URL(path, ROOT_URL).href : void 0;
		const title = anchor.find("span").text();
		const pubDate = parseDate(card.find("time").attr("datetime") ?? "");
		const category = card.find(".catab").text().trim();
		const imagePath = card.find(".thumb img").attr("src") ?? card.find(".thumb img").attr("data-src");
		return {
			title,
			link,
			pubDate,
			category: category ? [category] : void 0,
			image: imagePath ? new URL(imagePath, ROOT_URL).href : void 0
		};
	}).filter((item) => item.title && item.link).slice(0, limit), async (item, index) => {
		try {
			return await cache_default.tryGet(item.link, async () => {
				if (index > 0) await delay(DETAIL_FETCH_DELAY);
				return fetchDescription(item);
			});
		} catch {
			return item;
		}
	}, { concurrency: 1 });
	return {
		title: "GIGAZINE - English News",
		link: LIST_URL,
		language: "en",
		item: items
	};
}
//#endregion
export { route };
