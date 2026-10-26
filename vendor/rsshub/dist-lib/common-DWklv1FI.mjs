import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/jiemian/common.tsx
const handler = async (ctx) => {
	const { category, id } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const rootUrl = "https://www.jiemian.com";
	const pathSegment = category || (id ? `lists/${id}` : "");
	const currentUrl = new URL(pathSegment ? `${pathSegment}.html` : "", rootUrl).href;
	const $ = load(await rofetch(currentUrl));
	$(".sub-col-right").remove();
	const container = $("#lists").length ? $("#lists") : $("body");
	let items = {};
	const links = container.find("a").toArray();
	for (const el of links) {
		const item = $(el);
		const href = item.prop("href");
		const link = href ? href.startsWith("/") ? new URL(href, rootUrl).href : href : void 0;
		if (link && /\/(?:article|video)\/\w+\.html/.test(link)) items[link] = {
			title: item.text(),
			link
		};
	}
	items = await Promise.all(Object.values(items).slice(0, limit).map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link));
		const image = content("div.article-img img").first();
		const video = content("#video-player").first();
		content("p.report-view").remove();
		item.title = content("div.article-header h1").eq(0).text();
		item.description = renderDescription({
			image: image ? {
				src: image.prop("src"),
				alt: image.next("p").text() || item.title
			} : void 0,
			video: video ? {
				src: video.prop("data-url"),
				poster: video.prop("data-poster"),
				width: video.prop("width"),
				height: video.prop("height")
			} : void 0,
			intro: content("div.article-header p").text(),
			description: content("div.article-content").html()
		});
		item.author = content("span.author").first().find("a").toArray().map((a) => content(a).text()).join("/");
		item.category = content("meta.meta-container a").toArray().map((c) => content(c).text());
		item.pubDate = parseDate(content("div.article-info span[data-article-publish-time]").prop("data-article-publish-time"), "X");
		item.upvotes = content("span.opt-praise__count").text() ? Number(content("span.opt-praise__count").text()) : 0;
		item.comments = content("span.opt-comment__count").text() ? Number(content("span.opt-comment__count").text()) : 0;
		return item;
	})));
	const title = $("title").text();
	const titleSplits = title.split(/_/);
	const image = new URL($("link[rel=\"icon\"]").prop("href"), rootUrl).href;
	return {
		item: items,
		title,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image,
		icon: image,
		logo: image,
		subtitle: titleSplits[0],
		author: titleSplits.pop()
	};
};
const renderDescription = ({ image, intro, video, description }) => {
	const imageAlt = image?.height ?? image?.width ?? image?.alt;
	const videoPoster = video?.poster ?? image?.src;
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		!video?.src && image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image.src,
			alt: imageAlt
		}) }) : null,
		intro ? /* @__PURE__ */ jsx("p", { children: intro }) : null,
		video?.src ? /* @__PURE__ */ jsxs("video", {
			poster: videoPoster,
			controls: true,
			children: [/* @__PURE__ */ jsx("source", {
				src: video.src,
				type: video.type
			}), /* @__PURE__ */ jsx("object", {
				data: video.src,
				children: /* @__PURE__ */ jsx("embed", { src: video.src })
			})]
		}) : null,
		description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
	] }));
};
//#endregion
export { handler as t };
