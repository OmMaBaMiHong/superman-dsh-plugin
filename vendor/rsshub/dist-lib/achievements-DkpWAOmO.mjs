import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/peterwunder/achievements.ts
const author = "Peter Wunder";
const rootUrl = "https://projects.peterwunder.de";
const currentUrl = new URL("/achievements/", rootUrl).href;
const icon = new URL("/achievements/images/touchicon.png", rootUrl).href;
const defaultLimit = 20;
function absolutizeImageSource($, itemUrl) {
	$("article").first().find("[src]").each((_, element) => {
		const value = $(element).attr("src");
		if (value) $(element).attr("src", new URL(value, itemUrl).href);
	});
}
function extractBadgeDescription($) {
	const article = $("article").first();
	if (!article.length) return;
	article.find("h1, script, style, noscript").remove();
	return article.html() ?? void 0;
}
function extractListItems($, limit) {
	return $("section.badges a.badge").slice(0, limit).toArray().map((element) => {
		const badge = $(element);
		const href = badge.attr("href");
		const title = badge.find(".title").text().trim();
		if (!href || !title) return null;
		const image = badge.find("img").attr("src");
		const visibleStart = badge.attr("data-vis-start");
		return {
			title,
			link: new URL(href, rootUrl).href,
			pubDate: visibleStart ? parseDate(visibleStart) : void 0,
			image: image ? new URL(image, rootUrl).href : void 0
		};
	}).filter(Boolean);
}
function fetchBadge(item) {
	return cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		const title = $("article h1").first().text().trim();
		const visibleStart = $("ul.metadata li").first().find("time.date").first().attr("datetime");
		const image = $("meta[property=\"og:image\"]").attr("content");
		absolutizeImageSource($, item.link);
		return {
			...item,
			title: title || item.title,
			description: extractBadgeDescription($),
			pubDate: visibleStart ? parseDate(visibleStart) : item.pubDate,
			author,
			image: image ? new URL(image, rootUrl).href : item.image
		};
	});
}
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit")) || defaultLimit;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const items = await Promise.all(extractListItems($, limit).map((item) => fetchBadge(item)));
	return {
		title: "All Activity Challenges - New Badges",
		description: "Latest badge pages from Peter Wunder's All Activity Challenges catalog. The website's own Atom feed was discontinued on August 20, 2024, so this route follows the latest entries directly from the site.",
		link: currentUrl,
		item: items,
		language: "en",
		author,
		icon,
		logo: icon,
		image: icon
	};
};
const route = {
	path: "/achievements",
	categories: ["other"],
	view: 2,
	example: "/peterwunder/achievements",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["projects.peterwunder.de/achievements"] }],
	name: "New Badges",
	maintainers: ["LinxHex"],
	description: "Latest badge pages from Peter Wunder's All Activity Challenges catalog. `pubDate` uses the first 'Visible in the app' date because the site does not expose a publication timestamp.",
	handler,
	url: "projects.peterwunder.de/achievements"
};
//#endregion
export { route };
