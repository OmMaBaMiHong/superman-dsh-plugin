import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/aflcio/blog.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "5");
	const baseUrl = "https://aflcio.org";
	const targetUrl = new URL("blog", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("article.article").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("header.container h1 a").first();
		const title = $aEl.text();
		const description = $el.find("div.section").html() ?? "";
		const pubDateStr = $el.find("div.date-timeline time").attr("datetime");
		const linkUrl = $aEl.attr("href");
		const authors = $el.find("div.date-timeline a.user").toArray().map((authorEl) => {
			const $authorEl = $(authorEl);
			return {
				name: $authorEl.text(),
				url: $authorEl.attr("href") ? new URL($authorEl.attr("href"), baseUrl).href : void 0,
				avatar: void 0
			};
		});
		const image = $el.find("div.section img").first().attr("src") ? new URL($el.find("div.section img").first().attr("src"), baseUrl).href : void 0;
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			author: authors,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("header.article-header h1").text();
			const description = $$("div.section-article-body").html() ?? "";
			const pubDateStr = $$("time").attr("datetime");
			const authors = $$("div.byline a[property=\"schema:name\"]").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return {
					name: $$authorEl.text(),
					url: $$authorEl.attr("href") ? new URL($$authorEl.attr("href"), baseUrl).href : void 0,
					avatar: void 0
				};
			});
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
	}))).filter((_) => true);
	const title = $("title").text();
	return {
		title,
		description: title,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.main-logo").attr("src") ? new URL($("img.main-logo").attr("src"), baseUrl).href : void 0,
		author: title.split(/\|/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/blog",
	name: "Blog",
	url: "aflcio.org",
	maintainers: ["nczitzk"],
	handler,
	example: "/aflcio/blog",
	parameters: void 0,
	description: void 0,
	categories: ["other"],
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
		source: ["aflcio.org/blog"],
		target: "/blog"
	}],
	view: 0
};
//#endregion
export { handler, route };
