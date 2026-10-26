import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/perplexity/blog.ts
const route = {
	path: "/blog",
	example: "/perplexity/blog",
	url: "www.perplexity.ai",
	categories: ["blog"],
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.perplexity.ai/hub"],
		target: "/blog"
	}],
	name: "Blog",
	maintainers: ["seeyangzhi"],
	handler,
	description: "Perplexity Blog - Explore Perplexity's blog for articles, announcements, product updates, and tips to optimize your experience. Stay informed and make the most of Perplexity.",
	view: 5
};
async function handler(ctx) {
	const limit = Number(ctx.req.query("limit") ?? "20");
	const rootUrl = "https://www.perplexity.ai/hub";
	const { page, destroy, context } = await getPlaywrightPage(rootUrl, { onBeforeLoad: async (page) => {
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
	} });
	const $ = load(await page.evaluate(() => document.documentElement.innerHTML));
	const items = [];
	const seenLinks = /* @__PURE__ */ new Set();
	const featuredCard = $("[data-framer-name=\"Featured Card\"]").first();
	const featuredHref = featuredCard.find("a[href^=\"./hub/blog/\"]").first().attr("href");
	const featuredTitle = featuredCard.find("h4").first().text().trim();
	if (featuredHref && featuredTitle) {
		const link = new URL(featuredHref, rootUrl).href;
		seenLinks.add(link);
		items.push({
			link,
			title: featuredTitle
		});
	}
	for (const element of $("[data-framer-name=\"Article Card\"]").toArray()) {
		const $card = $(element);
		const href = $card.attr("href");
		const title = $card.find("h6").first().text().trim();
		if (!href || !title) continue;
		const link = new URL(href, rootUrl).href;
		if (seenLinks.has(link)) continue;
		seenLinks.add(link);
		const paragraphs = $card.find("p").toArray();
		const dateText = paragraphs.length > 0 ? $(paragraphs[0]).text().trim() : "";
		const pubDate = dateText ? parseDate(dateText) : void 0;
		const category = paragraphs.slice(1).map((p) => $(p).text().trim()).filter(Boolean);
		items.push({
			link,
			title,
			pubDate,
			category: category.length > 0 ? category : void 0
		});
	}
	const resultItems = await Promise.all(items.slice(0, limit).map(async (item) => {
		if (!item.link) return item;
		return await cache_default.tryGet(item.link, async () => {
			const contentPage = await context.newPage();
			await contentPage.route("**/*", (route) => {
				route.request().resourceType() === "document" ? route.continue() : route.abort();
			});
			await contentPage.goto(item.link, { waitUntil: "domcontentloaded" });
			const contentHtml = await contentPage.evaluate(() => document.documentElement.innerHTML);
			await contentPage.close();
			const $content = load(contentHtml);
			let pubDate = item.pubDate;
			if (!pubDate) {
				const timeEl = $content("time[datetime]").first();
				if (timeEl.length) pubDate = parseDate(timeEl.attr("datetime"));
			}
			$content("script, style, noscript").remove();
			const contentArea = $content("[data-framer-name=\"Content\"]").first();
			const description = contentArea.length ? contentArea.html() ?? void 0 : void 0;
			return {
				...item,
				pubDate,
				description
			};
		});
	}));
	await destroy();
	return {
		title: "Perplexity Blog",
		link: rootUrl,
		item: resultItems,
		language: "en"
	};
}
//#endregion
export { route };
