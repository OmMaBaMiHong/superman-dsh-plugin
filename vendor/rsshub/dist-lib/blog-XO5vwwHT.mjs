import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/augmentcode/blog.tsx
const renderDescription = ({ images, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt ?? void 0
}) }) : null), description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] }));
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "50");
	const baseUrl = "https://augmentcode.com";
	const targetUrl = new URL("blog", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div[data-slot=\"card\"]").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("div[data-slot=\"card-content\"]").text();
		const pubDateStr = $el.find("div[data-slot=\"card-footer\"] p").last().text();
		const linkUrl = $el.parent().attr("href");
		const authors = $el.find("div[data-slot=\"card-footer\"] p").first().find("span").toArray().map((authorEl) => {
			return {
				name: $(authorEl).contents().first().text(),
				url: void 0,
				avatar: void 0
			};
		});
		const image = $el.find("div[data-slot=\"card-header\"] img").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			author: authors,
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("article h1").text();
			const image = $$("meta[property=\"og:image\"]").attr("content") ?? item.image;
			const description = renderDescription({
				images: image ? [{
					src: image,
					alt: title
				}] : void 0,
				description: $$("div.prose").html() ?? void 0
			});
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
			const authors = $$("meta[property=\"article:author\"]").toArray().map((authorEl) => {
				return {
					name: $$(authorEl).attr("content"),
					url: void 0,
					avatar: void 0
				};
			});
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
	const title = $("title").text();
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: title.split(/-/).pop()?.trim(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/blog",
	name: "Blog",
	url: "augmentcode.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/augmentcode/blog",
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
		source: ["augmentcode.com/blog"],
		target: "/blog"
	}],
	view: 0
};
//#endregion
export { handler, route };
