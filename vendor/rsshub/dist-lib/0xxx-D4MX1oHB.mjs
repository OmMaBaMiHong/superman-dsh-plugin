import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/0xxx/templates/description.tsx
const renderDescription = ({ category, catalogue, title, size, date, images }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [category || catalogue || title || size || date ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	category ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Category" }), /* @__PURE__ */ jsx("td", { children: raw(category) })] }) : null,
	catalogue ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Catalogue" }), /* @__PURE__ */ jsx("td", { children: raw(catalogue) })] }) : null,
	title ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Title" }), /* @__PURE__ */ jsx("td", { children: raw(title) })] }) : null,
	size ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Size" }), /* @__PURE__ */ jsx("td", { children: raw(size) })] }) : null,
	date ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Date" }), /* @__PURE__ */ jsx("td", { children: raw(date) })] }) : null
] }) }) : null, images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt ?? void 0
}) }) : null)] }));
//#endregion
//#region lib/routes/0xxx/index.ts
const handler = async (ctx) => {
	const { filter } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "100");
	const baseUrl = "https://0xxx.ws";
	const targetUrl = new URL(filter ? `?${filter}` : "", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("table#home-table tr:not(.gore)").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $categoryEl = $el.find("td.category");
		const $catalogueEl = $el.find("td.catalogue");
		const $dateEl = $el.find("td.date");
		const title = $el.find("td.title").text();
		const image = $el.find("a.screenshot").attr("rel");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			category: $categoryEl.html(),
			catalogue: $catalogueEl.html(),
			title,
			size: $el.find("td.size").text(),
			date: $dateEl.html()
		});
		const pubDateStr = $dateEl.text();
		const linkUrl = $el.find("td.title a").attr("href");
		const categories = [.../* @__PURE__ */ new Set([
			$categoryEl.text()?.trim(),
			$catalogueEl.text()?.trim(),
			$dateEl.text()
		])].filter((c) => Boolean(c && c !== "-"));
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr, "DD.MM.YYYY") : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr, "DD.MM.YYYY") : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const description = renderDescription({ images: $$("div.thumbs img").toArray().map((i) => {
				const $i = $$(i);
				return {
					src: $i.attr("src"),
					alt: $i.attr("alt") ?? item.title
				};
			}) }) + (item.description ?? "");
			return {
				...item,
				description
			};
		});
	}));
	const title = $("title").text()?.split(/\|/).pop();
	return {
		title: title ? `${title} - ${filter}` : filter,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("div.logo img").attr("src") ? new URL($("div.logo img").attr("src"), baseUrl).href : void 0,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:filter?",
	name: "Source",
	url: "0xxx.ws",
	maintainers: ["nczitzk"],
	handler,
	example: "/0xxx/category=Movie-HD-1080p",
	parameters: { filter: { description: "Filter" } },
	description: `::: tip
To subscribe to [Movie HD 1080p](https://0xxx.ws?category=Movie-HD-1080p), where the source URL is \`https://0xxx.ws?category=Movie-HD-1080p\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/0xxx/category=Movie-HD-1080p\`](https://rsshub.app/0xxx/category=Movie-HD-1080p).
:::`,
	categories: ["multimedia"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nfsw: true
	},
	radar: [{
		source: ["0xxx.ws"],
		target: (_, url) => {
			const urlObj = new URL(url);
			urlObj.searchParams.delete("next");
			const filter = urlObj.searchParams.toString();
			return `/0xxx${filter ? `/${filter}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
