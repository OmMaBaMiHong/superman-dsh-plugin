import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/kadokawa/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) }) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] }));
//#endregion
//#region lib/routes/kadokawa/blog.ts
const handler = async (ctx) => {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const rootUrl = "https://www.kadokawa.com.tw";
	const currentUrl = new URL("blog/posts", rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const language = $("html").prop("lang");
	let items = $("div.List-item").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const image = item.find("div.List-item-excerpt img").prop("data-src")?.split(/\?/, 1)[0] ?? void 0;
		const title = item.find("h2.List-item-title").text();
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: item.find("div.List-item-preview").text()
		});
		return {
			title,
			description,
			pubDate: parseDate(item.find("span.primary-border-color-after").text()),
			link: new URL(item.find("a").prop("href"), rootUrl).href,
			content: {
				html: description,
				text: item.find("div.List-item-preview").text()
			},
			image,
			banner: image,
			language
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const $$ = load(detailResponse);
		$$("div.Post-content img[data-src]").each((_, img) => {
			$$(img).prop("src", $$(img).prop("data-src").split(/\?/, 1)[0]);
			$$(img).removeAttr("data-src");
		});
		const title = $$("h1.Post-title").text().trim();
		const description = renderDescription({ description: $$("div.Post-content").html() });
		const image = $$("meta[property=\"og:image\"]").prop("content")?.split(/\?/, 1)[0] ?? void 0;
		item.title = title;
		item.description = description;
		item.pubDate = parseDate($$("div.Post-date").text().trim());
		item.content = {
			html: description,
			text: $$("div.Post-content").text()
		};
		item.image = image;
		item.banner = image;
		item.language = language;
		return item;
	})));
	const image = new URL($("meta[property=\"og:image\"]").prop("content"), rootUrl).href;
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").prop("content"),
		link: currentUrl,
		item: items,
		allowEmpty: true,
		image,
		author: $("meta[property=\"og:site_name\"]").prop("content"),
		language
	};
};
const route = {
	path: "/blog",
	name: "角編新聞台",
	url: "kadokawa.com.tw",
	maintainers: ["nczitzk"],
	handler,
	example: "/kadokawa/blog",
	parameters: void 0,
	description: "",
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
		source: ["kadokawa.com.tw/blog/posts"],
		target: "/blog"
	}]
};
//#endregion
export { handler, route };
