import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/hk01/utils.tsx
const rootUrl = "https://hk01.com";
const apiRootUrl = "https://web-data.api.hk01.com";
const renderDescription = ({ image, teasers, blocks }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsx("img", { src: image }) : null,
	teasers?.length ? /* @__PURE__ */ jsx("backquote", { children: teasers.map((teaser) => /* @__PURE__ */ jsx("p", { children: teaser })) }) : null,
	blocks?.length ? blocks.map((block) => {
		if (block.blockType === "summary") return /* @__PURE__ */ jsx("backquote", { children: block.summary?.map((summary) => /* @__PURE__ */ jsx("p", { children: summary })) });
		if (block.blockType === "text") return block.htmlTokens?.map((tokens) => tokens.map((token) => {
			if (token.type === "text") return /* @__PURE__ */ jsx("p", { children: token.content });
			if (token.type === "link") return /* @__PURE__ */ jsx("a", {
				href: token.link,
				children: token.content
			});
			if (token.type === "boldText") return /* @__PURE__ */ jsx("b", { children: token.content });
			if (token.type === "boldLink") return /* @__PURE__ */ jsx("a", {
				href: token.link,
				children: /* @__PURE__ */ jsx("b", { children: token.content })
			});
			return null;
		}));
		if (block.blockType === "quote") return /* @__PURE__ */ jsxs("q", { children: [
			block.message,
			" —— ",
			block.author
		] });
		if (block.blockType === "image") {
			const { image: blockImage } = block;
			return blockImage ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("figurecaption", { children: blockImage.caption }), /* @__PURE__ */ jsx("img", {
				src: blockImage.cdnUrl,
				alt: blockImage.caption,
				height: blockImage.originalHeight,
				width: blockImage.originalWidth
			})] }) : null;
		}
		if (block.blockType === "gallery") return block.images?.map((blockImage) => /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("figurecaption", { children: blockImage.caption }), /* @__PURE__ */ jsx("img", {
			src: blockImage.cdnUrl,
			alt: blockImage.caption,
			height: blockImage.originalHeight,
			width: blockImage.originalWidth
		})] }));
		return null;
	}) : null
] }));
const ProcessItems = (items, limit) => Promise.all(items.filter((item) => item.type !== 2).slice(0, limit ? Number.parseInt(limit) : 50).map((item) => ({
	title: item.data.title,
	link: `${rootUrl}/sns/article/${item.data.articleId}`,
	pubDate: parseDate(item.data.publishTime * 1e3),
	category: item.data.tags.map((t) => t.tagName),
	author: item.data.authors.map((a) => a.publishName).join(", ")
})).map((item) => cache_default.tryGet(item.link, async () => {
	const detailResponse = await got_default({
		method: "get",
		url: item.link
	});
	const content = JSON.parse(detailResponse.data.match(/"__NEXT_DATA__" type="application\/json">(\{"props":.*\})<\/script>/)[1]);
	item.description = renderDescription({
		image: content.props.initialProps.pageProps.article.originalImage.cdnUrl,
		teasers: content.props.initialProps.pageProps.article.teaser,
		blocks: content.props.initialProps.pageProps.article.blocks
	});
	return item;
})));
//#endregion
export { apiRootUrl as n, rootUrl as r, ProcessItems as t };
