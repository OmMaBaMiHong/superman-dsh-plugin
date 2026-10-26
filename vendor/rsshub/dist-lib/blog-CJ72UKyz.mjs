import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/cursor/blog.ts
const handler = async (ctx) => {
	const { topic, locale } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "10");
	const baseUrl = "https://cursor.com";
	const normalizedTopic = topic === "all" ? void 0 : topic;
	const localeSegment = locale ? `/${locale}` : "";
	const path = normalizedTopic ? `${localeSegment}/blog/topic/${normalizedTopic}` : `${localeSegment}/blog`;
	const targetUrl = new URL(path, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const items = $("#main").last().find("article").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $link = $el.find("a").first();
		const title = $link.find("p").first().text().trim();
		const description = $link.find("p").eq(1).text().trim();
		const pubDate = parseDate($el.find("time").first().text().trim());
		const href = $link.attr("href");
		return {
			title,
			description,
			pubDate,
			link: href ? new URL(href, baseUrl).href : void 0
		};
	});
	return {
		title: $("title").text() || "Cursor Blog",
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content")
	};
};
const route = {
	path: "/blog/:topic?/:locale?",
	name: "Blog",
	url: "cursor.com",
	maintainers: ["johan456789"],
	example: "/cursor/blog",
	parameters: {
		locale: "Locale appended to the route path, e.g. `ja`",
		topic: "Topic: all | product | research | company | news"
	},
	description: void 0,
	categories: ["blog"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["cursor.com/blog"],
			target: "/blog"
		},
		{
			source: ["cursor.com/blog/topic/:topic"],
			target: "/blog/:topic"
		},
		{
			source: ["cursor.com/:locale/blog"],
			target: "/blog/all/:locale"
		},
		{
			source: ["cursor.com/:locale/blog/topic/:topic"],
			target: "/blog/:topic/:locale"
		}
	],
	view: 0,
	handler
};
//#endregion
export { handler, route };
