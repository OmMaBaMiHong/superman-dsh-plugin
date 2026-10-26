import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/thebrain/blog.tsx
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://www.thebrain.com";
	const targetUrl = new URL("blog", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.blog-row").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("h4 a");
		const title = $aEl.text();
		const image = $el.find("div.round-corner-images img").attr("src") ? `https:${$el.find("div.round-corner-images img").attr("src")?.split(/\?/, 1)[0]}` : void 0;
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image,
			alt: title
		}) }) : null, $el.find("p.small-text").next().html() ? raw($el.find("p.small-text").next().html()) : null] }));
		const pubDateStr = $el.find("p.small-text").text();
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
			const title = $$("h2.gradient-heading").text() || $$("h1.gradient-heading").text();
			$$("h2.gradient-heading").remove();
			$$("div#shareDiv").remove();
			const description = $$("div.blog-content").html() || $$("div.docs-section").html();
			const pubDateStr = $$("div.blog-meta").text();
			const categoryEls = $$("a.under-category").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const authors = $$("img.avatar").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl).parent().next().find("a");
				return {
					name: $$authorEl.text(),
					url: $$authorEl.attr("href") ? new URL($$authorEl.attr("href"), baseUrl).href : void 0,
					avatar: `https:${$$(authorEl).attr("src")?.split(/\?/, 1)[0]}`
				};
			});
			const upDatedStr = pubDateStr;
			const processedItem = {
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
			return {
				...item,
				...processedItem
			};
		});
	}));
	return {
		title: $("title").text(),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.navbar-logo").attr("src") ? new URL($("img.navbar-logo").attr("src"), baseUrl).href : void 0,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/blog",
	name: "Blog",
	url: "www.thebrain.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/thebrain/blog",
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
		source: ["www.thebrain.com/blog"],
		target: "/blog"
	}],
	view: 0
};
//#endregion
export { handler, route };
