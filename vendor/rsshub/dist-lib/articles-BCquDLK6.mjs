import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/rockthejvm/templates/description.tsx
const renderDescription = ({ intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null, description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] }));
//#endregion
//#region lib/routes/rockthejvm/articles.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://rockthejvm.com";
	const targetUrl = new URL("articles/1", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	$("footer").remove();
	let items = $("h2").slice(0, limit).toArray().map((el) => {
		const $el = $(el).parent().parent();
		const $aEl = $el.find("h2 a");
		const title = $aEl.text();
		const description = renderDescription({ intro: $el.find("p.text-content").first().text() });
		const pubDateStr = $el.find("time").attr("datetime");
		const linkUrl = $aEl.attr("href");
		const categoryEls = $el.find("a.bg-tag").toArray();
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const authors = $el.find("picture").toArray().map((authorEl) => {
			const $authorEl = $(authorEl).parent();
			return {
				name: $authorEl.find("p.text-content").text(),
				url: $authorEl.find("p.text-content a").attr("href") ? new URL($authorEl.find("p.text-content a").attr("href"), baseUrl).href : void 0,
				avatar: $authorEl.find("img").attr("src") ? new URL($authorEl.find("img").attr("src"), baseUrl).href : void 0
			};
		});
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			author: authors,
			content: {
				html: description,
				text: description
			},
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("meta[property=\"og:title\"]").attr("content") ?? item.title;
			const description = item.description + renderDescription({ description: $$("div.prose").html() ?? void 0 });
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
			const categoryEls = $$("meta[property=\"article:tag\"]").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).attr("content")).filter(Boolean))];
			const authors = $$("meta[property=\"article:author\"]").toArray().map((authorEl) => {
				return {
					name: $$(authorEl).attr("content"),
					url: void 0,
					avatar: void 0
				};
			});
			const image = $$("meta[property=\"og:image\"]").attr("content");
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
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/articles",
	name: "Article",
	url: "rockthejvm.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/rockthejvm/articles",
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
		source: ["rockthejvm.com/articles"],
		target: "/articles"
	}],
	view: 0
};
//#endregion
export { handler, route };
