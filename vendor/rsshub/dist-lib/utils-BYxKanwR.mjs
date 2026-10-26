import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/caareviews/utils.tsx
const rootUrl = "http://www.caareviews.org";
const getList = async (url) => {
	const $ = load((await got_default(url)).data);
	return $("#infinite-content > div").toArray().map((item) => ({
		title: $(item).find("div.title").text().trim(),
		link: new URL($(item).find("div.title > em > a").attr("href"), rootUrl).href,
		author: $(item).find("div.contributors").text().trim()
	}));
};
const getItems = (ctx, list) => Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
	const $ = load((await got_default(item.link)).data);
	const coverUrl = new URL($("div.cover > a").attr("href"), rootUrl).href;
	const content = $("div.content.full-review").html();
	item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: coverUrl }), raw(content ?? "")] }));
	$("div.review_heading").remove();
	item.pubDate = parseDate($("div.header-text > div.clearfix").text());
	item.doi = $("div.crossref > a").attr("href").replace("http://dx.doi.org/", "");
	return item;
})));
//#endregion
export { getList as n, rootUrl as r, getItems as t };
