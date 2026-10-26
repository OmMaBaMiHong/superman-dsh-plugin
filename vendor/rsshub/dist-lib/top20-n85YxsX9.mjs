import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/zhubai/top20.tsx
const renderContent = (content) => renderToString(/* @__PURE__ */ jsx(ZhubaiContent, { content }));
const route = {
	path: "/top20",
	categories: ["blog"],
	example: "/zhubai/top20",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["analy.zhubai.love/"] }],
	name: "上周热门 TOP 20",
	maintainers: ["nczitzk"],
	handler,
	url: "analy.zhubai.love/"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const rootUrl = "http://analy.zhubai.wiki";
	const apiUrl = new URL("a/zb/s/ht/pl/wk", "https://open.zhubai.wiki").href;
	const { data: response } = await got_default.post(apiUrl);
	let items = response.data.slice(0, limit).map((item) => ({
		title: item.pn,
		link: item.pu ?? item.pq ?? item.fp,
		description: item.pa,
		author: item.zn,
		pubDate: parseRelativeDate(item.lu.replace(/\.\d+/, ""))
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const matches = item.link.match(/\/(?:pl|pq|fp)\/([\w-]+)\/(\d+)/);
		const { data } = await got_default(`https://${matches[1]}.zhubai.love/api/posts/${matches[2]}`);
		item.title = data.title ?? item.title;
		item.description = data.content ? renderContent(JSON.parse(data.content)) : item.description;
		item.author = data.author?.name ?? item.author;
		item.pubDate = data.created_at ? parseDate(data.created_at) : item.pubDate;
		return item;
	})));
	const { data: currentResponse } = await got_default(rootUrl);
	const $ = load(currentResponse);
	const icon = $("link[rel=\"apple-touch-icon\"]").prop("href");
	return {
		item: items,
		title: `${$("meta[property=\"og:title\"]").prop("content")} - TOP20`,
		link: rootUrl,
		description: $("meta[property=\"og:description\"]").prop("content"),
		language: $("html").prop("lang"),
		image: $("meta[property=\"og:image\"]").prop("content"),
		icon,
		logo: icon,
		subtitle: $("meta[property=\"og:description\"]").prop("content"),
		author: $("meta[name=\"twitter:site\"]").prop("content")
	};
}
const ZhubaiContent = ({ content }) => /* @__PURE__ */ jsx(Fragment, { children: renderNodes(content) });
const renderNodes = (content) => content?.map((node) => {
	if (node.text) return node.text;
	switch (node.type) {
		case "paragraph": return /* @__PURE__ */ jsx("p", { children: renderNodes(node.children) });
		case "link": return /* @__PURE__ */ jsx("a", {
			href: node.url,
			children: renderNodes(node.children)
		});
		case "image": return /* @__PURE__ */ jsx("img", {
			src: node.url,
			height: node.naturalHeight,
			width: node.naturalWidth
		});
		case "list-item": return /* @__PURE__ */ jsx("li", { children: renderNodes(node.children) });
		case "bulleted-list": return /* @__PURE__ */ jsx("ul", { children: renderNodes(node.children) });
		case "numbered-list": return /* @__PURE__ */ jsx("ol", { children: renderNodes(node.children) });
		case "block-quote": return /* @__PURE__ */ jsx("blockquote", { children: renderNodes(node.children) });
		case "heading-one": return /* @__PURE__ */ jsx("h1", { children: renderNodes(node.children) });
		case "heading-two": return /* @__PURE__ */ jsx("h2", { children: renderNodes(node.children) });
		case "heading-three": return /* @__PURE__ */ jsx("h3", { children: renderNodes(node.children) });
		case "heading-four": return /* @__PURE__ */ jsx("h4", { children: renderNodes(node.children) });
		case "heading-five": return /* @__PURE__ */ jsx("h5", { children: renderNodes(node.children) });
		case "heading-six": return /* @__PURE__ */ jsx("h6", { children: renderNodes(node.children) });
		default: return null;
	}
}) ?? [];
//#endregion
export { route };
