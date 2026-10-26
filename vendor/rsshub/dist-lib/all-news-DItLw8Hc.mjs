import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/ornl/templates/description.tsx
const OrnlDescription = ({ images, intro, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt,
		width: image.width,
		height: image.height
	}) }) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(OrnlDescription, { ...data }));
//#endregion
//#region lib/routes/ornl/all-news.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "10");
	const baseUrl = "https://www.ornl.gov";
	const targetUrl = new URL("all-news", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.view-rows-main div.list-item-wrapper").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("div.list-item-title h2 a");
		const $imgEl = $el.find("div.list-item-thumbnail-wrapper img");
		const title = $aEl.text();
		const image = $imgEl.attr("src");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: $imgEl.attr("alt") || title,
				width: Number($imgEl.attr("width")) || void 0,
				height: Number($imgEl.attr("height")) || void 0
			}] : void 0,
			intro: $el.find("div.list-item-desc p").text()
		});
		const pubDateStr = $el.find("div.list-item-date").attr("datetime");
		const linkUrl = $aEl.attr("href");
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
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const $$imgEl = $$("div.image-landscape img");
			const title = $$("h1.page-title").text();
			const image = $$imgEl.attr("src");
			const description = renderDescription({
				images: image ? [{
					src: image,
					alt: $$imgEl.attr("alt") || title,
					width: Number($$imgEl.attr("width")) || void 0,
					height: Number($$imgEl.attr("height")) || void 0
				}] : void 0,
				description: $$("div.image-description").html()
			});
			const pubDateStr = $$("div.publish-date time").attr("datetime");
			const authors = $$("div.related-researcher-container").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl).find("div.related-researcher-name a");
				return {
					name: $$authorEl.text(),
					url: $$authorEl.attr("href") ? new URL($$authorEl.attr("href"), baseUrl).href : void 0,
					avatar: $$authorEl.find("div.related-researcher-photo img").attr("src") ? new URL($$authorEl.find("div.related-researcher-photo img").attr("src"), baseUrl).href : void 0
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
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[name=\"twitter:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/all-news",
	name: "All News",
	url: "www.ornl.gov",
	maintainers: ["nczitzk"],
	handler,
	example: "/ornl/all-news",
	parameters: void 0,
	description: void 0,
	categories: ["government"],
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
		source: ["www.ornl.gov/all-news"],
		target: "/all-news"
	}],
	view: 0
};
//#endregion
export { handler, route };
