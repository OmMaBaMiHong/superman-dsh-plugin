import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/science/utils.tsx
const baseUrl = "https://www.science.org";
const fetchDesc = (list, context) => Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(item.link, { waitUntil: "domcontentloaded" });
	await page.waitForSelector("section#bodymatter, .news-article-content, .news-article-content--featured");
	const res = await page.evaluate(() => document.documentElement.innerHTML);
	await page.close();
	const $ = load(res);
	const abstract = $("div#abstracts").html();
	const content = $(".news-article-content--featured").length ? $(".news-article-content--featured").html() : $(".news-article-content").length ? $(".news-article-content").html() : $(".info-panel__formats a.btn__request-access").length || $(".info-panel__formats a.btn--access").length ? "" : $("section#bodymatter").html();
	item.description = renderDescription(abstract, content);
	return item;
})));
const getItem = (item, $) => {
	item = $(item);
	return {
		title: item.find(".article-title a").attr("title"),
		link: `${baseUrl}${item.find(".article-title a").attr("href")}`,
		doi: item.find(".article-title a").attr("href").replace("/doi/", ""),
		pubDate: parseDate(item.find(".card-meta__item time").text()),
		author: item.find(".card-meta ul[title=\"list of authors\"] li").toArray().map((author) => $(author).text()).join(", ")
	};
};
const renderDescription = (abs, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [abs ? raw(abs) : null, content ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), raw(content)] }) : null] }));
//#endregion
export { fetchDesc as n, getItem as r, baseUrl as t };
