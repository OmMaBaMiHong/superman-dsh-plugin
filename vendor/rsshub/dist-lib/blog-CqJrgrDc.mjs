import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/mathpix/blog.tsx
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://mathpix.com";
	const targetUrl = new URL("blog", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const categoryMap = {};
	$("div.navbar-menu a.blog-category").each((_, el) => {
		const $el = $(el);
		const id = $el.attr("data-category");
		const name = $el.text()?.trim();
		if (id && name) categoryMap[id] = name;
	});
	let items = $("li.articles__item").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("a.articles__title").text();
		const image = $el.find("div.articles__image img").attr("srcset") ? new URL($el.find("div.articles__image img").attr("srcset"), baseUrl).href : void 0;
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image,
			alt: title
		}) }) : null, $el.find("div.articles__text").text() ? /* @__PURE__ */ jsx("blockquote", { children: $el.find("div.articles__text").text() }) : null] }));
		const pubDateStr = $el.find("time.articles__date").attr("datetime");
		const linkUrl = $el.find("a.articles__title").attr("href");
		const categories = ($el.attr("data-category")?.split(/,\s/).map((category) => category.trim()) ?? []).map((id) => categoryMap[id]).filter(Boolean);
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
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
			const title = $$("h1.article__title").text();
			const description = $$("div#setText").html();
			const processedItem = {
				title,
				description,
				content: {
					html: description,
					text: description
				},
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
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/blog",
	name: "Blog",
	url: "mathpix.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/mathpix/blog",
	parameters: void 0,
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
	radar: [{
		source: ["mathpix.com/blog"],
		target: "/blog"
	}],
	view: 0
};
//#endregion
export { handler, route };
