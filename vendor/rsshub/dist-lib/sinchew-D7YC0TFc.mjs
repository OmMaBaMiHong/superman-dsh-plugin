import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/sinchew/index.tsx
const route = {
	path: "*",
	radar: [{
		source: ["sinchew.com.my/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "sinchew.com.my/"
};
async function handler(ctx) {
	const rootUrl = "https://www.sinchew.com.my";
	const currentUrl = `${rootUrl}${getSubPath(ctx) === "/" ? "" : getSubPath(ctx)}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".title .internalLink").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20).toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return {
			title: item.attr("data-title"),
			link: link.startsWith("http") ? link : `${rootUrl}${link}`,
			pubDate: timezone(parseDate(item.text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".ads-frame, .read-more-msg").remove();
		content("figure").each((_, el) => {
			content(el).replaceWith(renderToString(/* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", { src: content(el).find("img").attr("src") }), /* @__PURE__ */ jsx("figcaption", { children: content(el).find("figcaption").text() })] })));
		});
		item.description = content(".article-page-content").html();
		item.pubDate = timezone(parseDate(content("meta[property=\"article:published_time\"]").attr("content")), 8);
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
