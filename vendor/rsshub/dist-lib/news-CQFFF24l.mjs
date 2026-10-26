import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/musikguru/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt ?? void 0
	}) }) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
//#endregion
//#region lib/routes/musikguru/news.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "10");
	const baseUrl = "https://musikguru.de";
	const targetUrl = new URL("news/", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "de";
	let items = $("section").eq(1).find("div.card").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("h5.card-title").text();
		const image = $el.find("img").attr("src");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $el.find("p.card-text").text()
		});
		const linkUrl = $el.find("a").first().attr("href");
		return {
			title,
			description,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.article h1").text();
			const leadHtml = ($$("p.lead").html() ?? "") + ($$("div.lead").html() ?? "");
			const description = item.description + renderDescription({ description: leadHtml || void 0 });
			const pubDateStr = $$("div.article div.text-muted").text().split(/\sUhr/, 1)?.[0];
			const image = $$("div.article img").first().attr("src");
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr, "DD.MM.YYYY HH:mm"), 1) : item.pubDate,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? timezone(parseDate(upDatedStr, "DD.MM.YYYY HH:mm"), 1) : item.updated,
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
		image: $("a.navbar-brand img").attr("src") ? new URL($("a.navbar-brand img").attr("src"), baseUrl).href : void 0,
		author: $("a.navbar-brand img").attr("alt"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/news",
	name: "News",
	url: "musikguru.de",
	maintainers: ["nczitzk"],
	handler,
	example: "/musikguru/news",
	parameters: void 0,
	description: void 0,
	categories: ["multimedia"],
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
		source: ["musikguru.de/news"],
		target: "news"
	}],
	view: 0
};
//#endregion
export { handler, route };
