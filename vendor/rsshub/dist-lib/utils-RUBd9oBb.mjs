import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/scmp/utils.ts
const renderHTML = (node) => {
	if (!node) return "";
	if (Array.isArray(node)) return node.map((n) => renderHTML(n)).join("");
	switch (node.type) {
		case "a": return `<a ${Object.entries(node.attribs).map(([key, value]) => `${key}="${value}"`).join(" ")}>${renderHTML(node.children)}</a>`;
		case "div": return `<div ${node.attribs ? Object.entries(node.attribs).map(([key, value]) => `${key}="${value}"`).join(" ") : ""}>${renderHTML(node.children)}</div>`;
		case "blockquote-quote": return `<blockquote>${renderHTML(node.children)}</blockquote>`;
		case "iframe": return `<iframe ${Object.entries(node.attribs).map(([key, value]) => `${key}="${value}"`).join(" ")}></iframe>`;
		case "leading":
		case "img": return `<figure><img ${node.attribs ? Object.entries(node.attribs).map(([key, value]) => `${key}="${value}"`).join(" ") : `url="${node.url}"`}><figcaption>${node.attribs?.title ?? node.title}</figcaption></figure>`;
		case "em":
		case "h3":
		case "li":
		case "ol":
		case "ul":
		case "p":
		case "strong":
		case "u": return `<${node.type}>${renderHTML(node.children)}</${node.type}>`;
		case "text": return node.data;
		case "script":
		case "inline-ad-slot":
		case "inline-widget":
		case "track-viewed-percentage": return "";
		default: return `Unhandled type: ${node.type} ${JSON.stringify(node)}`;
	}
};
const parseItem = async (item) => {
	const { _data: response, url } = await rofetch.raw(item.link);
	if (new URL(url).hostname !== "www.scmp.com") return item;
	const $ = load(response);
	const { article } = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.payload.data;
	item.summary = renderHTML(article.summary.json);
	item.description = renderHTML(article.subHeadline.json) + renderHTML(article.images.find((i) => i.type === "leading")) + renderHTML(article.body.json);
	item.updated = parseDate(article.updatedDate, "x");
	item.category = [.../* @__PURE__ */ new Set([
		...article.topics.map((t) => t.name),
		...article.sectionsV2?.flatMap((t) => t.value.map((v) => v.name)) ?? [],
		...article.keywords.map((k) => k?.split(", "))
	])];
	return item;
};
//#endregion
export { parseItem as t };
