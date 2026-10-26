import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/coolbuy/index.tsx
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "50");
	const baseUrl = "https://coolbuy.com";
	const imageBaseUrl = "https://mcache.ifanr.cn";
	const apiUrl = new URL("api/v1.4/product_preview", baseUrl).href;
	const response = await rofetch(apiUrl, { query: {
		order_by: "-id",
		limit,
		page: 0,
		offset: 0
	} });
	const $ = load(await rofetch(baseUrl));
	const language = $("html").attr("lang") ?? "zh";
	const items = response.objects.slice(0, limit).map((item) => {
		const title = item.title;
		const image = item.cover_image?.split(/\?/, 1)?.[0];
		const images = [item.display_image?.split(/\?/, 1)?.[0], image].filter(Boolean).map((image) => ({
			src: image,
			alt: title
		}));
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
			item.summary ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "简介" }), /* @__PURE__ */ jsx("td", { children: item.summary })] }) : null,
			item.price ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "价格" }), /* @__PURE__ */ jsx("td", { children: item.price })] }) : null,
			item.original_price ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "原价" }), /* @__PURE__ */ jsx("td", { children: item.original_price })] }) : null,
			item.highest_price ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "价格（最高）" }), /* @__PURE__ */ jsx("td", { children: item.highest_price })] }) : null,
			item.highest_original_price ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "原价（最高）" }), /* @__PURE__ */ jsx("td", { children: item.highest_original_price })] }) : null
		] }) }), images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: image.alt ? /* @__PURE__ */ jsx("img", {
			src: image.src,
			alt: image.alt
		}) : /* @__PURE__ */ jsx("img", { src: image.src }) }) : null) : null] }));
		const linkUrl = item.visit_url;
		const guid = `coolbuy-${item.id}#${item.price}`;
		return {
			title,
			description,
			link: linkUrl ?? new URL(item.id, baseUrl).href,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			language
		};
	});
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: baseUrl,
		item: items,
		allowEmpty: true,
		image: new URL("static/coolbuy/packages/dongguan/dist/images/97be46f6.png", imageBaseUrl).href,
		language,
		id: baseUrl
	};
};
const route = {
	path: "/",
	name: "产品",
	url: "coolbuy.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/coolbuy",
	parameters: void 0,
	description: void 0,
	categories: ["shopping"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["coolbuy.com"],
		target: "/"
	}],
	view: 0
};
//#endregion
export { handler, route };
