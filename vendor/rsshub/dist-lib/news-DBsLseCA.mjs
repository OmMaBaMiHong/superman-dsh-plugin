import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/ifeng/news.tsx
const route = {
	path: "/news/*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const currentUrl = `https://news.ifeng.com${getSubPath(ctx).replace(/^\/news/, "")}`;
	const response = await got_default({
		method: "get",
		url: currentUrl
	});
	const $ = load(response.data);
	let items = JSON.parse(response.data.match(/"newsstream":(\[.*?\]),"cooperation"/)[1]).slice(0, limit).map((item) => ({
		title: item.title,
		link: item.url,
		pubDate: timezone(parseDate(item.newsTime), 8),
		description: item.thumbnails.image.pop()
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		item.author = detailResponse.data.match(/"editorName":"(.*?)",/)[1];
		item.category = detailResponse.data.match(/\},"keywords":"(.*?)",/)[1].split(",");
		const image = item.description;
		const description = JSON.parse(detailResponse.data.match(/"contentList":(\[.*?\]),/)[1]).map((content) => content.data);
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image.url,
			height: image.height,
			width: image.width
		}) }) : null, description?.length ? description.map((entry) => entry?.attachmentType === "video" ? /* @__PURE__ */ jsx("video", {
			controls: true,
			poster: entry.bigPosterUrl,
			children: /* @__PURE__ */ jsx("source", { src: entry.playUrl })
		}) : typeof entry === "string" ? /* @__PURE__ */ jsx(Fragment, { children: raw(entry.replaceAll("data-lazyload=", "src=")) }) : null) : null] }));
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
