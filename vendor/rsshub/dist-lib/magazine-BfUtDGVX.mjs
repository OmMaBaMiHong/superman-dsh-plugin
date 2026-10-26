import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/raspberrypi/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: image.alt ? /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) : /* @__PURE__ */ jsx("img", { src: image.src }) }) : null) : null,
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] }));
//#endregion
//#region lib/routes/raspberrypi/magazine.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "12");
	const baseUrl = "https://magazine.raspberrypi.com";
	const targetUrl = new URL("issues", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const author = $("meta[property=\"og:site_name\"]").attr("content");
	let items = $("div.o-grid--equal div.o-grid__col").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("h2.rspec-issue-card-heading a.c-link");
		const title = $aEl.text()?.trim();
		const image = $el.find("div.o-media__fixed a.c-link img").attr("src");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $el.find("p.rspec-issue-card-summary").text()
		});
		const pubDateStr = $el.find("time").attr("datetime");
		const linkUrl = $aEl.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			author,
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
			const title = $$("h1.rspec-issue__heading").text().split(/-/).pop()?.trim() ?? item.title;
			const description = item.description + renderDescription({ description: $$("div.rspec-issue__description").html() || void 0 });
			const pubDateStr = $$("time.rspec-issue__publication-month").attr("datetime");
			const image = $$("img.c-figure__image").attr("src");
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				author,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			const pdfUrl = new URL("pdf/download", `${item.link}/`).href;
			const $$$enclosureEl = load(await rofetch(pdfUrl))("a.c-link").first();
			const enclosureUrl = $$$enclosureEl.attr("href") ? new URL($$$enclosureEl.attr("href"), baseUrl).href : void 0;
			if (enclosureUrl) {
				const enclosureType = "application/pdf";
				processedItem = {
					...processedItem,
					enclosure_url: enclosureUrl,
					enclosure_type: enclosureType,
					enclosure_title: title,
					enclosure_length: void 0
				};
			}
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/magazine",
	name: "Official Magazine",
	url: "magazine.raspberrypi.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/raspberrypi/magazine",
	parameters: void 0,
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
		source: ["magazine.raspberrypi.com"],
		target: "/raspberrypi/magazine"
	}],
	view: 0
};
//#endregion
export { handler, route };
