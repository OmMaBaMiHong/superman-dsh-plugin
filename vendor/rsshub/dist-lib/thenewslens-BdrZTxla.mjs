import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/thenewslens/templates/description.tsx
const TheNewsLensDescription = ({ image, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("img", { src: image }) : null, description ? raw(description) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(TheNewsLensDescription, { ...data }));
//#endregion
//#region lib/routes/thenewslens/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://www.thenewslens.com${getSubPath(ctx) === "/" ? "/latest-article" : getSubPath(ctx)}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$("h1.title").remove();
	let items = $(".regular-article-list, #list-container, .list-container").find(".article-title, .title").find("a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25).toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return {
			title: item.text(),
			link: /\/article\//.test(link) ? `${link}/fullpage` : link
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("#salon_comment_widget-anchor").remove();
		content("ad2-recommender, footer, noscript").remove();
		content("a[data-sk=\"tooltip_parent\"]").parent().remove();
		content(".ad-section, .recommender-title, .navigation-content").remove();
		content(".article-img-container").each((_, el) => {
			content(el).replaceWith(renderDescription({ image: content(el).find("img")?.attr("data-srcset").split("?", 1)[0] ?? void 0 }));
		});
		item.author = content("meta[property=\"article:author\"]").attr("content");
		item.pubDate = parseDate(content("meta[property=\"article:published_time\"]").attr("content"));
		item.category = content("meta[property=\"article:tag\"]").toArray().map((t) => content(t).attr("content"));
		item.description = renderDescription({
			image: content("meta[property=\"og:image\"]")?.attr("content").split("?", 1)[0] ?? void 0,
			description: content(".article-main-box, article[itemprop=\"articleBody\"]").html()
		});
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
