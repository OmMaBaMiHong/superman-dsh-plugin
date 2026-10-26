import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/bookwalker/search.tsx
const handler = async (ctx) => {
	const { filter = "order=sell_desc" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "24");
	const baseUrl = "https://www.bookwalker.com.tw";
	const targetUrl = new URL(`search?${filter}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-TW";
	const items = $("div.bwbook_package").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const name = $el.find("h4.bookname").text();
		const price = $el.find("h5.bprice").text();
		const authorStr = $el.find("h5.booknamesub").text().trim();
		const title = `${name} - ${authorStr} ${price}`;
		const image = $el.find("img").attr("data-src")?.replace(/_\d+(\.\w+)$/, "$1");
		const description = renderToString(image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image,
			alt: name
		}) }) : null);
		const linkUrl = $el.find("div.bwbookitem a").attr("href");
		const authors = authorStr.split(/,/).map((a) => ({ name: a }));
		return {
			title,
			description,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			author: authors,
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
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/search/:filter?",
	name: "搜尋",
	url: "www.bookwalker.com.tw",
	maintainers: ["nczitzk"],
	handler,
	example: "/bookwalker/search/order=sell_desc&s=34",
	parameters: { filter: { description: "过滤器，默认为 `order=sell_desc`，即依發售日新至舊排序" } },
	description: `::: tip
订阅 [依發售日新至舊排序的文學小說](https://www.bookwalker.com.tw/search?order=sell_desc\\&s=34)，其源网址为 \`https://www.bookwalker.com.tw/search?order=sell_desc&s=34\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/bookwalker/search/order=sell_desc&s=34\`](https://rsshub.app/bookwalker/search/order=sell_desc\\&s=34)。
:::`,
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
		source: ["www.bookwalker.com.tw/search"],
		target: "/bookwalker/search"
	}],
	view: 0
};
//#endregion
export { handler, route };
