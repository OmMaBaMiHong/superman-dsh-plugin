import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/news/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: image.alt ? /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) : /* @__PURE__ */ jsx("img", { src: image.src }) }) : null) : null,
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] }));
//#endregion
//#region lib/routes/news/xhsxw.ts
const route = {
	path: ["/xhsxw", "/whxw"],
	categories: ["new-media"],
	example: "/news/xhsxw",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.cn/xhsxw.htm"] }],
	name: "新华社新闻",
	maintainers: ["nczitzk"],
	handler,
	url: "news.cn/xhsxw.htm"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100;
	const rootUrl = "http://www.news.cn";
	const currentUrl = new URL("xhsxw.htm", rootUrl).href;
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const id = $("ul.wz-list").prop("data").replace(/datasource:/, "");
	const apiUrl = new URL(`ds_${id}.json`, rootUrl).href;
	const { data: { datasource: response } } = await got_default(apiUrl);
	let items = response.slice(0, limit).map((item) => ({
		title: item.title,
		link: new URL(item.publishUrl, rootUrl).href,
		description: renderDescription({
			images: item.shareImages?.map((i) => ({
				src: i.imageUrl,
				alt: item.title
			})) ?? void 0,
			intro: item.summary
		}),
		author: item.author,
		category: item.keywords.split(/-|,/),
		guid: `news-${item.contentId}`,
		pubDate: timezone(parseDate(item.publishTime), 8)
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const { data: detailResponse } = await got_default(item.link);
			const content = load(detailResponse);
			item.description += renderDescription({ description: content("#detailContent").html() });
		} catch {}
		return item;
	})));
	const title = $("title").text();
	const image = new URL("20141223_xhsxw_logo_v1.png", rootUrl).href;
	const icon = new URL("favicon.ico", rootUrl).href;
	return {
		item: items,
		title,
		link: currentUrl,
		description: title.split(/_/, 1)[0],
		language: "zh",
		image,
		icon,
		logo: icon,
		author: title.split(/_/).pop(),
		allowEmpty: true
	};
}
//#endregion
export { route };
