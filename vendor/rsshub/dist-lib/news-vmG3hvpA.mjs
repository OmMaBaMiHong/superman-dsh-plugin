import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/x410/templates/description.tsx
const renderDescription = ({ images, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }) : null), description ? raw(description) : null] }));
//#endregion
//#region lib/routes/x410/news.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://x410.dev";
	const targetUrl = new URL("news", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("article.post").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("h4 a");
		const title = $aEl.text();
		const description = renderDescription({ description: $el.find("div#cookbook").html() });
		const pubDateStr = $el.find("span.updated").text();
		const linkUrl = $aEl.attr("href");
		const image = $el.find("ul.slides li a img").attr("src")?.replace(/-\d+x\d+/, "");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
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
			$$("img").each((_, imgEl) => {
				const $$imgEl = $$(imgEl);
				const src = $$imgEl.attr("data-orig-src");
				if (src && src.startsWith("/")) $$imgEl.attr("src", new URL(src, baseUrl).href);
			});
			const title = $$(".title").text();
			const description = renderDescription({ description: $$("div#cookbook").html() });
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
			const categoryEls = $$("div.post-header-text-cat p a").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const authors = $$("meta[name=\"author\"]").toArray().map((authorEl) => {
				return {
					name: $$(authorEl).attr("content") || "",
					url: void 0,
					avatar: void 0
				};
			});
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const upDatedStr = $$(".time").text() || pubDateStr;
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
		image: $("meta[name=\"msapplication-TileImage\"]").attr("content") ? new URL($("meta[name=\"msapplication-TileImage\"]").attr("content"), baseUrl).href : void 0,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/news",
	name: "News",
	url: "x410.dev",
	maintainers: ["nczitzk"],
	handler,
	example: "/x410/news",
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
		source: ["x410.dev"],
		target: "/news"
	}],
	view: 0
};
//#endregion
export { handler, route };
