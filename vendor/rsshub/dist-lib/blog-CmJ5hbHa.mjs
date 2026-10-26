import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/kiro/blog.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://kiro.dev";
	const targetUrl = new URL("blog/", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("main a.group").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("h4").text();
		const pubDateStr = $el.find("time").text();
		const linkUrl = $el.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("header h1").text();
			const description = $$("div.prose").html() ?? void 0;
			const pubDateStr = $$("time").text();
			const authorEl = $$("img.aspect-square").parent().parent();
			const authors = [{
				name: authorEl.find("p").first().text(),
				url: void 0,
				avatar: authorEl.find("img").attr("src")
			}];
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				author: authors,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/blog",
	name: "Blog",
	url: "kiro.dev",
	maintainers: ["nczitzk"],
	handler,
	example: "/kiro/blog",
	parameters: void 0,
	description: void 0,
	categories: ["programming"],
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
		source: ["kiro.dev", "kiro.dev/blog/"],
		target: "/blog"
	}],
	view: 0
};
//#endregion
export { handler, route };
