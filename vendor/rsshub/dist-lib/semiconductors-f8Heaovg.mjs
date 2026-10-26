import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/semiconductors/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt,
		width: image.width,
		height: image.height
	}) }) : null) : null,
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] }));
//#endregion
//#region lib/routes/semiconductors/index.ts
const handler = async (ctx) => {
	const { category = "news-events/latest-news" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "12");
	const baseUrl = "https://www.semiconductors.org";
	const targetUrl = new URL(category.endsWith("/") ? category : `${category}/`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.col-sm-8").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a").first();
		const title = $aEl.text();
		const image = $el.prev().find("img").attr("src")?.replace(/-\d+x\d+\./, ".");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $aEl.next().text()
		});
		const pubDateStr = $el.find("div.resource-item-meta").text().split(/:\s+/).pop();
		const linkUrl = $aEl.attr("href");
		const categoryEls = $el.find("div.resource-item-category span.ric").toArray();
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr, "DD/MM/YY") : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr, "DD/MM/YY") : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1").text();
			$$("h1").remove();
			$$("main#main").contents().first().remove();
			$$("main#main p").first().remove();
			$$("div.newshr").remove();
			const image = $$("meta[property=\"og:image\"]").attr("content")?.replace(/-scaled\./, ".");
			const description = renderDescription({
				images: image ? [{
					src: image,
					alt: title
				}] : void 0,
				description: $$("main#main").html() || void 0
			});
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
			const authors = $$("meta[name=\"author\"]").toArray().map((authorEl) => {
				return {
					name: $$(authorEl).attr("content"),
					url: void 0,
					avatar: void 0
				};
			});
			const upDatedStr = $$("meta[property=\"article:modified_time\"]").attr("content");
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
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/:category{.+}?",
	name: "Latest News",
	url: "www.semiconductors.org",
	maintainers: ["nczitzk"],
	handler,
	example: "/semiconductors/news-events/latest-news",
	parameters: { category: { description: "Category, `news-events/latest-news` by default" } },
	description: `::: tip
To subscribe to [Latest News](https://www.semiconductors.org/news-events/latest-news/), where the source URL is \`https://www.semiconductors.org/news-events/latest-news/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/semiconductors/news-events/latest-news\`](https://rsshub.app/semiconductors/news-events/latest-news).
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
		source: ["www.semiconductors.org/:category"],
		target: "/:category"
	}],
	view: 0
};
//#endregion
export { handler, route };
