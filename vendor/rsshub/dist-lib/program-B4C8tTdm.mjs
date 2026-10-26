import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/iqilu/templates/description.tsx
const renderDescription = ({ image, video, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image?.src && !video ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) }) : null,
	video ? /* @__PURE__ */ jsxs("video", {
		poster: image?.src,
		controls: true,
		children: [/* @__PURE__ */ jsx("source", {
			src: video.src,
			type: video.type
		}), /* @__PURE__ */ jsx("object", {
			data: video.src,
			children: /* @__PURE__ */ jsx("embed", { src: video.src })
		})]
	}) : null,
	description ? /* @__PURE__ */ jsx("p", { children: description }) : null
] }));
//#endregion
//#region lib/routes/iqilu/program.ts
const route = {
	path: "/v/:category{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { category = "sdws/sdxwlb" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "http://v.iqilu.com";
	const currentUrl = new URL(category, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("#jmzhanshi1 dl").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		const image = item.find("img").first();
		item.find("dd").last().remove();
		return {
			title: a.prop("title"),
			link: a.prop("href"),
			description: renderDescription({ image: {
				src: image.prop("src"),
				alt: image.prop("alt")
			} }),
			pubDate: parseDate(item.find("dd").last().text().match(/(\d{4}-\d{2}-\d{2})/)[1]),
			itunes_item_image: image.prop("src")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.title = content("div.vtitle").text();
		item.enclosure_url = content("#copy_mp4text").prop("value");
		item.enclosure_type = item.enclosure_url ? `video/${item.enclosure_url.split(/\./).pop()}` : void 0;
		item.description = renderDescription({
			image: {
				src: item.itunes_item_image,
				alt: item.title
			},
			video: {
				src: item.enclosure_url,
				type: item.enclosure_type
			},
			description: content("div.vinfo").text().trim()
		});
		return item;
	})));
	const icon = new URL($("link[rel=\"icon\"]").prop("href"), rootUrl).href;
	const author = $("div.host_pic dl dd a").toArray().map((a) => $(a).text()).join("/");
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image: $("div.s_logo img").prop("src"),
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author,
		itunes_author: author,
		itunes_category: "News",
		allowEmpty: true
	};
}
//#endregion
export { route };
