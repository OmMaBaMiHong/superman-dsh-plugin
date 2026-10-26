import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tvtropes/featured.tsx
const categories = {
	today: "left",
	newest: "right"
};
const route = {
	path: "/featured/:category?",
	categories: ["other"],
	example: "/tvtropes/featured/today",
	parameters: { category: "Category, see below, Today's Featured Trope by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Featured",
	maintainers: ["nczitzk"],
	handler,
	description: `| Today's Featured Trope | Newest Trope |
| ---------------------- | ------------ |
| today                  | newest       |`
};
async function handler(ctx) {
	const { category = "today" } = ctx.req.param();
	const rootUrl = "https://tvtropes.org";
	const { data: response } = await got_default(rootUrl);
	const $ = load(response);
	const item = $(`div#featured-tropes div.${categories[category]}`);
	const link = new URL(item.find("h2.entry-title a").prop("href"), rootUrl).href;
	const { data: detailResponse } = await got_default(link);
	const content = load(detailResponse);
	content("div.folderlabel").remove();
	content("div.lazy_load_img_box").each((_, el) => {
		el = content(el);
		const image = el.find("img");
		el.replaceWith(renderToString(/* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image.prop("src"),
			alt: image.prop("alt"),
			width: image.prop("width"),
			height: image.prop("height")
		}) })));
	});
	const items = [{
		title: item.find("h2.entry-title").text(),
		link,
		description: content("div#main-article").html()
	}];
	const image = new URL($("img.logo-big").prop("src"), rootUrl).href;
	const icon = $("link[rel=\"shortcut icon\"]").prop("href");
	return {
		item: items,
		title: `${$("title").text()} - ${item.find("span.box-title").text()}`,
		link: rootUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image,
		icon,
		logo: icon,
		subtitle: $("meta[property=\"og:title\"]").prop("content"),
		author: $("meta[property=\"og:site_name\"]").prop("content"),
		allowEmpty: true
	};
}
//#endregion
export { route };
