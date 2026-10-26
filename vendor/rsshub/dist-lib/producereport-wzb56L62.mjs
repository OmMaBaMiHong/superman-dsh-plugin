import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/producereport/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt ?? void 0
	}) }) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
//#endregion
//#region lib/routes/producereport/index.ts
const handler = async (ctx) => {
	const { category = "produce/fresh-fruits/apples" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "10");
	const baseUrl = "https://www.producereport.com";
	const targetUrl = new URL(category, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("table.views-table tbody tr").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a").first();
		const title = $aEl.text();
		const image = $el.find("td.views-field-field-image a img").attr("src")?.replace(/styles\/thumbnail\/public/, "")?.split(/\?/, 1)?.[0];
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $aEl.parent().contents().last().text().trim()
		});
		const pubDateStr = $el.find("td.views-field-created").contents().first().text()?.trim();
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
			const title = $$("meta[property=\"og:title\"]").attr("content") ?? item.title;
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const description = renderDescription({
				images: image ? [{
					src: image,
					alt: title
				}] : void 0,
				description: $$("div[property=\"content:encoded\"]").html() ?? void 0
			});
			const pubDateStr = $$("div.pane-node-created").text()?.trim();
			const categoryEls = $$("div.pane-node-field-topics a").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const authors = $$("div.pane-node-author a.username").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return {
					name: $$authorEl.text(),
					url: $$authorEl.attr("href") ? new URL($$authorEl.attr("href"), baseUrl).href : void 0,
					avatar: void 0
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
		description: $("meta[property=\"og:title\"]").attr("content"),
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
	path: "/:category{.+}?",
	name: "Category",
	url: "www.producereport.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/producereport/produce/fresh-fruits/apples",
	parameters: { category: { description: "Category, `Fresh Fruits - Apple` by default" } },
	description: `::: tip
To subscribe to [Apples](https://www.producereport.com/produce/fresh-fruits/apples), where the source URL is \`https://www.producereport.com/produce/fresh-fruits/apples\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/producereport/produce/fresh-fruits/apples\`](https://rsshub.app/producereport/produce/fresh-fruits/apples).
:::`,
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
		source: ["www.producereport.com/:category"],
		target: "/:category"
	}],
	view: 0
};
//#endregion
export { handler, route };
