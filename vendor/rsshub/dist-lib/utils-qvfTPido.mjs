import { t as logger } from "./logger-BS24s3sd.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/dailypush/utils.ts
const BASE_URL = "https://www.dailypush.dev";
const allowedRequestTypes = /* @__PURE__ */ new Set(["document"]);
async function preparePage(page) {
	await page.route("**/*", (route) => {
		const request = route.request();
		if (allowedRequestTypes.has(request.resourceType())) {
			route.continue();
			return;
		}
		route.abort();
	});
}
async function fetchPageHtml(context, url, waitForSelector) {
	const page = await context.newPage();
	await preparePage(page);
	try {
		logger.http(`Requesting ${url}`);
		await page.goto(url, { waitUntil: "domcontentloaded" });
		if (waitForSelector) await page.waitForSelector(waitForSelector);
		return await page.content();
	} finally {
		await page.close();
	}
}
/**
* Try to parse text as a date. Returns the Date if parsing succeeds and is valid, undefined otherwise.
*/
function tryParseAsDate(text) {
	try {
		const date = parseRelativeDate(text);
		return Number.isNaN(date.getTime()) ? void 0 : date;
	} catch {
		return;
	}
}
/**
* Extract author from article element
*/
function extractAuthor(article) {
	const container = article.find(".flex.items-center.gap-3").first();
	if (container.length === 0) return;
	const allSpans = container.find("span");
	const contentSpans = [];
	for (let i = 0; i < allSpans.length; i++) {
		const $span = allSpans.eq(i);
		const text = $span.text().trim();
		if (text !== "•" && !$span.hasClass("text-slate-300") && !$span.hasClass("dark:text-slate-600")) contentSpans.push(text);
	}
	switch (contentSpans.length) {
		case 3:
			if (contentSpans[0].includes(",")) return contentSpans[0].split(",").map((author) => ({ name: author.trim() }));
			return contentSpans[0];
		case 2: {
			const firstText = contentSpans[0];
			if (tryParseAsDate(firstText)) break;
			return firstText;
		}
		case 1: {
			const text = contentSpans[0];
			if (tryParseAsDate(text)) return;
			return text;
		}
		default: break;
	}
	const sourceSpan = article.find("span.text-xs.font-medium.uppercase").first();
	if (sourceSpan.length > 0) return sourceSpan.text().trim();
}
/**
* Extract categories/tags from article element
*/
function extractCategories(article, $) {
	return article.find("a[href^=\"/\"]").toArray().map((tagEl) => {
		const tagElement = $(tagEl);
		const tagHref = tagElement.attr("href");
		const tagText = tagElement.text().trim();
		if (tagHref && tagText && !tagHref.includes("article/") && !tagHref.includes("Summary") && tagText.length < 50 && !/^(?:Summary|stats|About|Tags|Toggle|Trending|Latest|Previous|Next)$/i.test(tagText)) return tagText;
		return null;
	}).filter((tagText) => tagText !== null);
}
/**
* Extract publication date from article element
*/
function extractPubDate(article) {
	const container = article.find(".flex.items-center.gap-3").first();
	if (container.length === 0) return;
	const allSpans = container.find("span");
	const contentSpans = [];
	for (let i = 0; i < allSpans.length; i++) {
		const $span = allSpans.eq(i);
		const text = $span.text().trim();
		if (text !== "•" && !$span.hasClass("text-slate-300") && !$span.hasClass("dark:text-slate-600")) contentSpans.push(text);
	}
	let dateText;
	switch (contentSpans.length) {
		case 3:
			dateText = contentSpans[1];
			break;
		case 2: {
			const firstText = contentSpans[0];
			dateText = tryParseAsDate(firstText) ? firstText : contentSpans[1];
			break;
		}
		case 1: {
			const text = contentSpans[0];
			if (tryParseAsDate(text)) dateText = text;
			break;
		}
		default: break;
	}
	return dateText ? tryParseAsDate(dateText) : void 0;
}
/**
* Parse a single article element into an ArticleItem
*/
function parseArticle(article, $, baseUrl) {
	const titleLink = article.find("h2 a[href^=\"http\"]");
	if (titleLink.length === 0) return null;
	const title = titleLink.text().trim();
	const link = titleLink.attr("href");
	if (!title || !link || link.includes("dailypush.dev")) return null;
	const author = extractAuthor(article);
	const description = article.find("p.text-sm.text-muted-foreground").text().trim();
	const categories = extractCategories(article, $);
	const summaryLink = article.find(".flex.items-center.justify-between.gap-4.flex-wrap").find("a[href*=\"/article/\"]").attr("href");
	const dailyPushUrl = summaryLink ? `${baseUrl}${summaryLink}` : void 0;
	return {
		title,
		link,
		author,
		pubDate: extractPubDate(article),
		category: categories.length > 0 ? categories : void 0,
		description,
		articleUrl: link,
		dailyPushUrl,
		language: "en"
	};
}
/**
* Parse all articles from the page
*/
function parseArticles($, baseUrl) {
	return $("article").toArray().map((articleEl) => {
		return parseArticle($(articleEl), $, baseUrl);
	}).filter((parsed) => parsed !== null);
}
/**
* Enhance items with full summaries from dailypush article pages.
* Uses the provided context; opens a new tab per URL (document requests only). Caller must close the context.
*/
async function enhanceItemsWithSummaries(context, items) {
	const itemsWithUrl = items.filter((item) => item.dailyPushUrl !== void 0);
	const itemsWithoutUrl = items.filter((item) => item.dailyPushUrl === void 0);
	return [...await Promise.all(itemsWithUrl.map((item) => cache_default.tryGet(item.dailyPushUrl, async () => {
		try {
			const summary = load(await fetchPageHtml(context, item.dailyPushUrl, "p.font-ibm-plex-sans.leading-relaxed"))("p.font-ibm-plex-sans.leading-relaxed");
			if (summary.length > 0 && summary.text().trim()) item.description = summary.text().trim();
		} catch {}
		return item;
	}))), ...itemsWithoutUrl];
}
//#endregion
export { parseArticles as i, enhanceItemsWithSummaries as n, fetchPageHtml as r, BASE_URL as t };
