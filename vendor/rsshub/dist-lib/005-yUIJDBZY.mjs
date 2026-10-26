import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/005/index.tsx
const handler = async (ctx) => {
	const { category = "zx" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const rootUrl = "https://005.tv";
	const currentUrl = new URL(category ? `${category}/` : "", rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const language = $("html").prop("lang");
	let items = $("div.article-list ul li").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const title = item.find("h3").text();
		const image = item.find("img").prop("src");
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image,
			alt: title
		}) }) : null, item.find("div.p-row").text() ? /* @__PURE__ */ jsx("blockquote", { children: item.find("div.p-row").text() }) : null] }));
		return {
			title,
			description,
			pubDate: parseDate(item.find("span.time").text()),
			link: new URL(item.find("h3 a").prop("href"), rootUrl).href,
			content: {
				html: description,
				text: item.find("div.p-row").text()
			},
			image,
			banner: image,
			language
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const $$ = load(detailResponse);
		const title = $$("h1.articleTitle-name").text();
		const description = $$("div.articleContent").html();
		item.title = title;
		item.description = description;
		item.pubDate = timezone(parseDate($$(".time").text()), 8);
		item.category = $$("meta[name=\"keywords\"]").prop("content").split(/,/);
		item.content = {
			html: description,
			text: $$("div.articleContent").text()
		};
		item.language = language;
		return item;
	})));
	const title = $("title").text();
	const image = new URL("templets/muban/style/images/logo.png", rootUrl).href;
	return {
		title,
		description: title.split(/_/, 1)[0],
		link: currentUrl,
		item: items,
		allowEmpty: true,
		image,
		author: title.split(/,/).pop(),
		language
	};
};
const route = {
	path: "/:category?",
	name: "资讯",
	url: "005.tv",
	maintainers: ["nczitzk"],
	handler,
	example: "/005/zx",
	parameters: { category: "分类，可在对应分类页 URL 中找到，默认为二次元资讯" },
	description: `| 二次元资讯 | 慢慢说 | 道听途说 | 展会资讯 |
| ---------- | ------ | -------- | -------- |
| zx         | zwh    | dtts     | zh       |`,
	categories: ["anime"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["005.tv/:category"],
			target: (params) => {
				const category = params.category;
				return `/005${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "二次元资讯",
			source: ["005.tv/zx/"],
			target: "/005/zx"
		},
		{
			title: "慢慢说",
			source: ["005.tv/zwh/"],
			target: "/005/zwh"
		},
		{
			title: "道听途说",
			source: ["005.tv/dtts/"],
			target: "/005/dtts"
		},
		{
			title: "展会资讯",
			source: ["005.tv/zh/"],
			target: "/005/zh"
		}
	]
};
//#endregion
export { handler, route };
