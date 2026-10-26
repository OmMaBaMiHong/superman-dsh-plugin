import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/zhonglun/templates/description.tsx
const renderDescription = ({ intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null, description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] }));
//#endregion
//#region lib/routes/zhonglun/index.ts
const handler = async (ctx) => {
	const { language = "zh" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = `https://${language === "zh" ? "www" : language.replaceAll(/[^\dA-Z-]/gi, "")}.zhonglun.com`;
	const currentUrl = new URL("research/articles", rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("div#dataList > dl > dd, div#dataList > ul > li").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const description = renderDescription({ intro: item.find("p").text() });
		return {
			title: item.find("h3 > a").text(),
			description,
			pubDate: parseDate(item.find("span").text()),
			link: item.find("h3 > a").prop("href"),
			language
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const $$ = load(detailResponse);
		const title = $$("div.news_dtitle h2").text();
		const description = item.description + renderDescription({ description: $$("div.edit_con_original").html() });
		const image = $$("img.raw-image").first().prop("src");
		item.title = title;
		item.description = description;
		item.pubDate = parseDate($$("span.posttime").text());
		item.author = $$("span.author").text().split(/：/).pop();
		item.content = {
			html: description,
			text: $$("div.edit_con_original").text()
		};
		item.image = image;
		item.banner = image;
		item.language = language;
		return item;
	})));
	const image = new URL($("header.header h1 a img").prop("src"), rootUrl).href;
	return {
		title: `${$("title").text()} - ${$("div.siteban_text").text()}`,
		description: $("meta[name=\"description\"]").prop("content"),
		link: currentUrl,
		item: items,
		allowEmpty: true,
		image,
		author: $("meta[name=\"author\"]").prop("content"),
		language
	};
};
const route = {
	path: "/research/article/:language?",
	name: "中伦研究专业文章",
	url: "zhonglun.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/zhonglun/research/article/zh",
	parameters: { category: "语言，默认为 zh，即简体中文，可在对应分类页 URL 中找到" },
	description: `| ENG | 简体中文 | 日本語 | 한국어 |
| --- | -------- | ------ | ------ |
| en  | zh       | ja     | kr     |`,
	categories: ["new-media"],
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
			title: "专业文章",
			source: ["zhonglun.com/research/articles"],
			target: "/research/article/zh"
		},
		{
			title: " Articles",
			source: ["en.zhonglun.com/research/articles"],
			target: "/research/article/en"
		},
		{
			title: "論評",
			source: ["ja.zhonglun.com/research/articles"],
			target: "/research/article/ja"
		},
		{
			title: "전문기사",
			source: ["kr.zhonglun.com/research/articles"],
			target: "/research/article/kr"
		}
	]
};
//#endregion
export { handler, route };
