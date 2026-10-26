import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/ccg/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: image.alt ? /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) : /* @__PURE__ */ jsx("img", { src: image.src }) }) : null) : null,
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] }));
//#endregion
//#region lib/routes/ccg/index.ts
const handler = async (ctx) => {
	const { category = "news" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "7");
	const baseUrl = "http://www.ccg.org.cn";
	const targetUrl = new URL(category, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("ul.huodong-list li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("h5").text();
		const image = $el.find("div.huodong-img img").attr("src");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $el.find("p").html() || void 0
		});
		const pubDateStr = $el.find("span").text();
		const linkUrl = $el.find("a").attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr, "YYYY年M月D日") : void 0,
			link: linkUrl,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr, "YYYY年M月D日") : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.pinpai-page h3").text();
			const pubDateStr = $$("span.time").text();
			$$("div.pinpai-page h3").remove();
			$$("div.pinpai-page span.time").remove();
			const description = renderDescription({ description: $$("div.pinpai-page").html() || void 0 });
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr, "YYYY年M月D日") : item.pubDate,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? parseDate(upDatedStr, "YYYY年M月D日") : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	const author = $("h1.nav-logo").first().text();
	return {
		title: `${author} - ${$("title").text()}`,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: new URL("wp-content/themes/ccg/imgs/nav-logo.png", baseUrl).href,
		author,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:category?",
	name: "动态",
	url: "www.ccg.org.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/ccg/news",
	parameters: { category: {
		description: "分类，默认为 `news`，即新闻动态，可在对应分类页 URL 中找到",
		options: [{
			label: "新闻动态",
			value: "news"
		}, {
			label: "媒体报道",
			value: "mtbd"
		}]
	} },
	description: `::: tip
订阅 [新闻动态](http://www.ccg.org.cn/news)，其源网址为 \`http://www.ccg.org.cn/news\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/ccg/news\`](https://rsshub.app/ccg/news)。
:::

| 分类                                   | ID                                  |
| -------------------------------------- | ----------------------------------- |
| [新闻动态](http://www.ccg.org.cn/news) | [news](https://rsshub.app/ccg/news) |
| [媒体报道](http://www.ccg.org.cn/mtbd) | [mtbd](https://rsshub.app/ccg/mtbd) |`,
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
			source: ["www.ccg.org.cn/category"],
			target: "/:category"
		},
		{
			title: "新闻动态",
			source: ["www.ccg.org.cn/news"],
			target: "/news"
		},
		{
			title: "媒体报道",
			source: ["www.ccg.org.cn/mtbd"],
			target: "/mtbd"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
