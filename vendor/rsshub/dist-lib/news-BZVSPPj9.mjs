import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/dn/templates/description.tsx
const DnDescription = ({ image, abstracts, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) }) : null,
	abstracts ? /* @__PURE__ */ jsx("backquote", { children: raw(abstracts) }) : null,
	description ? raw(description) : null
] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(DnDescription, { ...data }));
//#endregion
//#region lib/routes/dn/news.ts
const route = {
	path: "/:language/news/:category?",
	categories: ["new-media"],
	example: "/dn/en-us/news",
	parameters: {
		language: "Language, see below",
		category: "Category, see below, The Latest by default"
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
	maintainers: ["nczitzk"],
	handler,
	description: `#### Language

| English | 中文  |
| ------- | ----- |
| en-us   | zh-cn |

#### Category

| English Category     | 中文分类 | Category id |
| -------------------- | -------- | ----------- |
| The Latest           | 最新     |             |
| Industry Information | 行业资讯 | category-1  |
| Knowledge            | 域名知识 | category-2  |
| Investment           | 域名投资 | category-3  |`
};
async function handler(ctx) {
	const { language, category = "" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const rootUrl = "https://dn.com";
	const currentUrl = new URL(`/${language}/news/${category}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("a.list-item").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const image = item.find("div.img img");
		return {
			title: item.find("h2.ellipse2").text(),
			link: new URL(item.prop("href"), rootUrl).href,
			description: renderDescription({
				image: image ? {
					src: image.prop("src"),
					alt: image.prop("alt")
				} : void 0,
				abstracts: item.find("p.abstract").html()
			}),
			category: item.find("span.cat").toArray().map((c) => $(c).text()),
			pubDate: timezone(parseDate(item.find("span.time").text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.title = content("h1.tit").text();
		item.description = renderDescription({
			abstracts: content("div.abstract").html(),
			description: content("div.detail").html()
		});
		item.author = content("span.author").text().replace(/(By|作者)\s/, "");
		item.category = [...item.category, ...content("div.tags p a").toArray().map((c) => content(c).text())];
		item.pubDate = timezone(parseDate(content("span.date").text()), 8);
		return item;
	})));
	const title = $("a.logo img").prop("alt");
	const icon = $("link[rel=\"icon\"]").prop("href");
	return {
		item: items,
		title: `${title} - ${$("div.group a.active").text()}`,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image: new URL($("a.logo img").prop("src"), rootUrl).href,
		icon,
		logo: icon,
		subtitle: $("title").text(),
		author: title
	};
}
//#endregion
export { route };
