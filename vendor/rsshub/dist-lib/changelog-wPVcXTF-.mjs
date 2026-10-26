import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/cursor/changelog.ts
const handler = async (ctx) => {
	const locale = ctx.req.param("locale");
	const limit = Number(ctx.req.query("limit") ?? "100");
	const baseUrl = "https://cursor.com";
	const localeSegment = locale ? `/${locale}` : "";
	const targetUrl = new URL(`${localeSegment}/changelog`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const items = $("main").first().find("article").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const timeEl = $el.find("time").first();
		const pubDateStr = timeEl.attr("datetime") || timeEl.text().trim();
		const versionLabel = timeEl.closest("a").find(".label").text().trim();
		const linkEl = $el.find("h1 a").first();
		const titleText = linkEl.length ? linkEl.text().trim() : $el.find("h1").first().text().trim();
		const title = versionLabel ? `[${versionLabel}] ${titleText}` : titleText;
		const linkUrl = linkEl.attr("href");
		let guid = linkUrl ? linkUrl.split("/").pop() : "unknown";
		if (versionLabel) guid = `cursor-changelog-${versionLabel}`;
		const description = $el.find(".prose").html() || "";
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			language
		};
	});
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content") || $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		language
	};
};
const route = {
	path: "/changelog/:locale?",
	name: "Changelog",
	url: "cursor.com",
	maintainers: ["p3psi-boo", "nczitzk"],
	handler,
	example: "/cursor/changelog",
	parameters: { locale: "Locale appended to the route path, e.g. `ja`" },
	description: void 0,
	categories: ["program-update"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cursor.com/changelog"],
		target: "/changelog"
	}, {
		source: ["cursor.com/:locale/changelog"],
		target: "/changelog/:locale"
	}],
	view: 0
};
//#endregion
export { handler, route };
