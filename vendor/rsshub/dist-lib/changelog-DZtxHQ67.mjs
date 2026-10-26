import "./types-DNj6Etbg.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/perplexity/changelog.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "20");
	const baseUrl = "https://www.perplexity.ai";
	const targetUrl = `${baseUrl}/changelog`;
	logger.http(`Fetching Perplexity changelog from ${targetUrl}`);
	const { page, destroy, context } = await getPlaywrightPage(targetUrl, { onBeforeLoad: async (page) => {
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
	} });
	const $ = load(await page.evaluate(() => document.documentElement.innerHTML));
	const language = $("html").attr("lang") ?? "en";
	const seenLinks = /* @__PURE__ */ new Set();
	const items = $("a[href^=\"./changelog/\"]").toArray().map((elem) => {
		const $link = $(elem);
		const href = $link.attr("href");
		if (!href || !href.startsWith("./changelog/")) return null;
		const fullLink = href.startsWith("http") ? href : `${baseUrl}${href.replace("./", "/")}`;
		if (seenLinks.has(fullLink)) return null;
		const $title = $link.find("[data-framer-name=\"Title\"]").first();
		const title = $title.text().trim() || href.replace("./changelog/", "").replaceAll("-", " ");
		const $category = $link.find("[data-framer-name=\"Category\"] p").first();
		const dateText = $category.text().trim();
		let $summary = $link.find("[data-framer-name=\"Description\"] p, [data-framer-name=\"Summary\"] p").first();
		if (!$summary.length) $summary = $link.find("p.framer-text").not($title).not($category).first();
		const summary = $summary.text().trim();
		seenLinks.add(fullLink);
		let pubDate;
		if (dateText) {
			const dateMatch = dateText.match(/(\d{2})\.(\d{2})\.(\d{2,4})/);
			if (dateMatch) {
				const [, month, day, year] = dateMatch;
				pubDate = parseDate(`${year.length === 2 ? `20${year}` : year}-${month}-${day}`);
			} else pubDate = parseDate(dateText);
		} else {
			const dateMatch = title.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,\s*\d{4}/);
			if (dateMatch) pubDate = parseDate(dateMatch[0]);
		}
		return {
			title,
			description: summary,
			link: fullLink,
			pubDate,
			guid: `perplexity-changelog-${fullLink}`,
			id: `perplexity-changelog-${fullLink}`
		};
	}).filter((item) => item !== null);
	const resultItems = await Promise.all(items.slice(0, limit).map(async (item) => {
		if (!item.link) return item;
		return await cache_default.tryGet(item.link, async () => {
			logger.http(`Fetching full content for ${item.link}`);
			const contentPage = await context.newPage();
			await contentPage.route("**/*", (route) => {
				route.request().resourceType() === "document" ? route.continue() : route.abort();
			});
			await contentPage.goto(item.link, { waitUntil: "domcontentloaded" });
			const contentHtml = await contentPage.evaluate(() => document.documentElement.innerHTML);
			await contentPage.close();
			const fullContent = load(contentHtml)("div#main > div > div > div[data-framer-component-type=\"RichTextContainer\"]").first().html()?.trim() || "";
			return {
				...item,
				description: fullContent || item.description
			};
		});
	}));
	await destroy();
	return {
		title: $("title").text() || "Perplexity Changelog",
		description: $("meta[name=\"description\"], meta[property=\"og:description\"]").first().attr("content") || "Latest updates and changes from Perplexity",
		link: targetUrl,
		item: resultItems,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		language
	};
};
const route = {
	path: "/changelog",
	name: "Changelog",
	url: "www.perplexity.ai",
	maintainers: ["xbot"],
	handler,
	example: "/perplexity/changelog",
	description: "Subscribe to Perplexity changelog for latest updates and releases.",
	categories: ["program-update"],
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.perplexity.ai/changelog"],
		target: "/changelog"
	}],
	view: 0
};
//#endregion
export { handler, route };
