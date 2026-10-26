import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { destr } from "destr";
import { raw } from "hono/html";
//#region lib/routes/esquirehk/tag.tsx
const topics = /* @__PURE__ */ new Set([
	"style",
	"watches",
	"lifestyle",
	"health",
	"money-investment",
	"gear",
	"people",
	"watch",
	"mens-talk"
]);
const handler = async (ctx) => {
	let { id = "Fashion" } = ctx.req.param();
	id = id.toLowerCase();
	const rootUrl = "https://www.esquirehk.com";
	let currentUrl = `${rootUrl}/tag/${id}`;
	if (topics.has(id)) currentUrl = `${rootUrl}/${id}`;
	const response = await rofetch(currentUrl);
	const $ = cheerio.load(response);
	const list = [...$("div[class^=\"max-w-[100%]\"] > div > div:nth-child(2) > a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text().trim(),
			link: new URL(item.attr("href"), currentUrl).href
		};
	}), ...$("div.list-item > div > div:nth-child(2) > a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text().trim(),
			link: new URL(item.attr("href"), currentUrl).href
		};
	})].map((item) => ({
		...item,
		slug: item.link.replace(rootUrl, "")
	})).filter((item) => !item.slug.startsWith("/campaign"));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = destr(await rofetch(`https://api.esquirehk.com${item.slug}`));
		if (response.status === "404") return item;
		item.description = response.intro.raw + renderSubpages(response.subpages);
		item.pubDate = parseDate(response.date.published, "X");
		item.updated = parseDate(response.date.lastModified, "X");
		item.author = response.author.name;
		item.category = [...response.tags.topic.map((tag) => tag.name), ...response.tags.normal.map((tag) => tag.name)];
		return item;
	})));
	return {
		title: `${$("head title").text()} - Esquirehk`,
		description: $("head meta[name=\"description\"]").attr("content"),
		image: $("head meta[property=\"og:image\"]").attr("content"),
		logo: $("head meta[property=\"og:image\"]").attr("content"),
		link: currentUrl,
		item: items
	};
};
const renderSubpages = (subpages) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: subpages?.map((page, index) => {
	const blocks = [];
	switch (page.type) {
		case "image": {
			const image = page.image?.large || page.image?.desktop || page.image?.mobile;
			blocks.push(/* @__PURE__ */ jsx("img", {
				src: image?.src,
				alt: image?.alt
			}, `image-${index}`));
			break;
		}
		case "video_block": {
			const videoId = page.source?.split("&", 1)[0];
			blocks.push(/* @__PURE__ */ jsx("iframe", {
				id: "ytplayer",
				type: "text/html",
				width: "640",
				height: "360",
				src: `https://www.youtube-nocookie.com/embed/${videoId}`,
				frameborder: "0",
				allowfullscreen: true,
				referrerpolicy: "strict-origin-when-cross-origin"
			}, `video-${index}`));
			break;
		}
		case "ctc_product_list":
			blocks.push(/* @__PURE__ */ jsx("span", { children: page.products?.map((product, productIndex) => {
				const img = product.image?.desktop || product.image?.mobile;
				return /* @__PURE__ */ jsxs("span", { children: [
					/* @__PURE__ */ jsx("img", {
						src: img?.src,
						alt: img?.alt
					}),
					/* @__PURE__ */ jsx("br", {}),
					product.brand,
					/* @__PURE__ */ jsx("br", {}),
					product.name,
					/* @__PURE__ */ jsx("br", {}),
					"HKD $",
					product.price,
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("a", {
						href: product.url,
						children: "SHOP NOW"
					})
				] }, `product-${productIndex}`);
			}) }, `products-${index}`));
			break;
		default: blocks.push(/* @__PURE__ */ jsxs("span", { children: ["UNHANDLED PAGE TYPE: ", page.type] }, `unknown-${index}`));
	}
	if (page.title) blocks.push(/* @__PURE__ */ jsxs("h2", { children: [page.order ? `${page.order} ` : "", page.title] }, `title-${index}`));
	if (page.description?.raw) blocks.push(/* @__PURE__ */ jsx("span", { children: raw(page.description.raw) }, `description-${index}`));
	return /* @__PURE__ */ jsx("span", { children: blocks }, `page-${index}`);
}) }));
const route = {
	path: "/tag/:id?",
	categories: ["new-media"],
	example: "/esquirehk/tag/Fashion",
	parameters: { id: "标签，可在对应标签页 URL 中找到" },
	name: "Tag",
	maintainers: ["nczitzk"],
	radar: [{ source: ["www.esquirehk.com/tag/:id", "www.esquirehk.com/:id"] }],
	handler
};
//#endregion
export { route };
