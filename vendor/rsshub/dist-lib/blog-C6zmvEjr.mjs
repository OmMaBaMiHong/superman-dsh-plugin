import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gaoyu/templates/description.tsx
const GaoyuDescription = ({ intro, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null, description ? raw(description) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(GaoyuDescription, { ...data }));
//#endregion
//#region lib/routes/gaoyu/blog.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "20");
	const baseUrl = "https://www.gaoyu.me";
	const targetUrl = new URL("blog", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-cn";
	const authors = [{
		name: "Yu Gao",
		url: baseUrl,
		avatar: void 0
	}];
	let items = $("a.flex-col").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("p.text-neutral-900").text();
		const description = renderDescription({ intro: $el.find("p.text-neutral-600").last().html() });
		const pubDateStr = $el.find("p.text-neutral-600").first().text();
		const linkUrl = $el.attr("href");
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
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1.title").text();
			const description = item.description + renderDescription({ description: $$("article.prose").html() });
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
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
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/blog",
	name: "Blog",
	url: "www.gaoyu.me",
	maintainers: ["nczitzk"],
	handler,
	example: "/gaoyu/blog",
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
		source: ["www.gaoyu.me/blog"],
		target: "/blog"
	}],
	view: 0
};
//#endregion
export { handler, route };
