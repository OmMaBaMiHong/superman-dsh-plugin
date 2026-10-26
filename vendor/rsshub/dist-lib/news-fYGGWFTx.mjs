import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as renderDescription } from "./description-Cu2nBjkU.mjs";
import { load } from "cheerio";
//#region lib/routes/asiafruitchina/news.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://asiafruitchina.net";
	const targetUrl = new URL("category/news", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("div.listBlocks ul li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("div.storyDetails h3 a");
		const title = $aEl.text();
		const description = renderDescription({ images: $el.find("a.image img").length > 0 ? $el.find("a.image img").toArray().map((imgEl) => {
			const $imgEl = $(imgEl);
			return {
				src: $imgEl.attr("src"),
				alt: $imgEl.attr("alt")
			};
		}) : void 0 });
		const pubDateStr = $el.find("span.date").text();
		const linkUrl = $aEl.attr("href");
		const image = $el.find("a.image img").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
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
			const title = $$("div.story_title h1").text();
			const description = renderDescription({ description: $$("div.storytext").html() ?? void 0 });
			const pubDateStr = $$("span.date").first().text().split(/：/).pop();
			const categories = $$("meta[name=\"keywords\"]").attr("content")?.split(/,/).map((c) => c.trim()) ?? [];
			const authors = $$("span.author").first().text();
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			const extraLinks = $$("div.extrasStory ul li").toArray().map((extraLinkEl) => {
				const $$extraLinkEl = $$(extraLinkEl);
				return {
					url: $$extraLinkEl.find("a").attr("href"),
					type: "related",
					content_html: $$extraLinkEl.html()
				};
			}).filter((_) => true);
			if (extraLinks) processedItem = {
				...processedItem,
				_extra: { links: extraLinks }
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const title = $("title").text().trim();
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.logo").attr("src"),
		author: title.split(/-/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/news",
	name: "行业资讯",
	url: "asiafruitchina.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/asiafruitchina/news",
	parameters: void 0,
	description: void 0,
	categories: ["new-media"],
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
		source: ["asiafruitchina.net/category/news"],
		target: "/asiafruitchina/news"
	}],
	view: 0
};
//#endregion
export { handler, route };
