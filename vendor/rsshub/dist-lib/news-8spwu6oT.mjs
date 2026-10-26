import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/google/news.tsx
const baseUrl = "https://news.google.com";
const route = {
	path: "/news/:category/:locale",
	categories: ["new-media"],
	example: "/google/news/Top stories/hl=en-US&gl=US&ceid=US:en",
	parameters: {
		category: "Category Title",
		locale: "locales, could be found behind `?`, including `hl`, `gl`, and `ceid` as parameters"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["zoenglinghou", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const locale = ctx.req.param("locale");
	const categoryUrl = (await cache_default.tryGet(`google:news:${locale}`, async () => {
		const $ = load(await rofetch(`${baseUrl}/?${locale}`));
		return [...$("a.brSCsc").toArray().slice(3).map((item) => {
			item = $(item);
			return {
				category: item.text(),
				url: new URL(item.attr("href"), baseUrl).href
			};
		}), ...$("a.aqvwYd").toArray().map((item) => {
			item = $(item);
			return {
				category: item.text(),
				url: new URL(item.attr("href"), baseUrl).href
			};
		})];
	})).find((item) => item.category === category).url;
	const $ = load(await rofetch(categoryUrl));
	const items = [
		...$(".UwIKyb"),
		...$(".IBr9hb"),
		...$(".IFHyqb")
	].map((item) => {
		item = $(item);
		const title = item.find(".gPFEn").text();
		const authorText = item.find(".bInasb span").text();
		const authors = authorText ? authorText.replace(/^By\s+/i, "").replaceAll(/\s+\([^)]*\)/g, "").split(/,|\s+&\s+|\s+and\s+/).map((author) => author.trim()).filter((author) => {
			if (!author) return false;
			return ["et al", "et al."].every((suffix) => !author.toLowerCase().endsWith(suffix));
		}).map((author) => ({ name: author })) : [];
		return {
			title,
			description: renderDescription(item.find("img.Quavad").attr("src"), title),
			pubDate: parseDate(item.find("time").attr("datetime")),
			author: authors,
			link: new URL(item.find("a.WwrzSb").first().attr("href"), baseUrl).href
		};
	});
	return {
		title: $("title").text(),
		link: categoryUrl,
		item: items
	};
}
const renderDescription = (img, brief) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [img ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: img }), /* @__PURE__ */ jsx("br", {})] }) : null, brief] }));
//#endregion
export { route };
