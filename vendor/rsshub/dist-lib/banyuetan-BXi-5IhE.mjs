import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/banyuetan/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: image.alt ? /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) : /* @__PURE__ */ jsx("img", { src: image.src }) }) : null) : null,
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] }));
//#endregion
//#region lib/routes/banyuetan/index.ts
const handler = async (ctx) => {
	const { id = "jinritan" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "http://www.banyuetan.org";
	const targetUrl = new URL(`byt/${id}/index.html`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("div.bty_tbtj_list ul.clearFix li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("h3 a");
		const title = $aEl.text();
		const image = $el.find("img").attr("src");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $el.find("p").text()
		});
		const pubDateStr = $el.find("span.tag3").text();
		const linkUrl = $aEl.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.detail_tit h1").text();
			const description = item.description + renderDescription({ description: $$("div#detail_content").html() || void 0 });
			const pubDateStr = $$("meta[property=\"og:release_date\"]").attr("content");
			const categories = $$("META[name=\"keywords\"]").attr("content")?.split(/,/) ?? [];
			const authors = [...$$("META[name=\"author\"]").toArray(), ...$$("META[name=\"source\"]").toArray()].map((authorEl) => {
				return {
					name: $$(authorEl).attr("content"),
					url: void 0,
					avatar: void 0
				};
			});
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	const title = $("title").text();
	return {
		title,
		description: title,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: new URL("static/v1/image/logo.png", baseUrl).href,
		author: title.split(/—/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:id?",
	name: "栏目",
	url: "www.banyuetan.org",
	maintainers: ["nczitzk"],
	handler,
	example: "/banyuetan/jinritan",
	parameters: { id: {
		description: "栏目 ID，默认为 `jinritan`，即今日谈，可在对应分类页 URL 中找到",
		options: [
			{
				label: "今日谈",
				value: "jinritan"
			},
			{
				label: "时政讲解",
				value: "shizhengjiangjie"
			},
			{
				label: "评论",
				value: "banyuetanpinglun"
			},
			{
				label: "基层治理",
				value: "jicengzhili"
			},
			{
				label: "文化",
				value: "wenhua"
			},
			{
				label: "教育",
				value: "jiaoyu"
			}
		]
	} },
	description: `::: tip
订阅 [今日谈](http://www.banyuetan.org/byt/jinritan/)，其源网址为 \`http://www.banyuetan.org/byt/jinritan/\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/banyuetan/jinritan\`](https://rsshub.app/banyuetan/jinritan)。
:::

| 栏目                                                                 | ID                                                                |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [今日谈](http://www.banyuetan.org/byt/jinritan/index.html)           | [jinritan](https://rsshub.app/banyuetan/jinritan)                 |
| [时政讲解](http://www.banyuetan.org/byt/shizhengjiangjie/index.html) | [shizhengjiangjie](https://rsshub.app/banyuetan/shizhengjiangjie) |
| [评论](http://www.banyuetan.org/byt/banyuetanpinglun/index.html)     | [banyuetanpinglun](https://rsshub.app/banyuetan/banyuetanpinglun) |
| [基层治理](http://www.banyuetan.org/byt/jicengzhili/index.html)      | [jicengzhili](https://rsshub.app/banyuetan/jicengzhili)           |
| [文化](http://www.banyuetan.org/byt/wenhua/index.html)               | [wenhua](https://rsshub.app/banyuetan/wenhua)                     |
| [教育](http://www.banyuetan.org/byt/jiaoyu/index.html)               | [jiaoyu](https://rsshub.app/banyuetan/jiaoyu)                     |`,
	categories: ["traditional-media"],
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
			source: ["www.banyuetan.org/byt/:id"],
			target: "/:id"
		},
		{
			title: "今日谈",
			source: ["www.banyuetan.org/byt/jinritan/index.html"],
			target: "/jinritan"
		},
		{
			title: "时政讲解",
			source: ["www.banyuetan.org/byt/shizhengjiangjie/index.html"],
			target: "/shizhengjiangjie"
		},
		{
			title: "评论",
			source: ["www.banyuetan.org/byt/banyuetanpinglun/index.html"],
			target: "/banyuetanpinglun"
		},
		{
			title: "基层治理",
			source: ["www.banyuetan.org/byt/jicengzhili/index.html"],
			target: "/jicengzhili"
		},
		{
			title: "文化",
			source: ["www.banyuetan.org/byt/wenhua/index.html"],
			target: "/wenhua"
		},
		{
			title: "教育",
			source: ["www.banyuetan.org/byt/jiaoyu/index.html"],
			target: "/jiaoyu"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
