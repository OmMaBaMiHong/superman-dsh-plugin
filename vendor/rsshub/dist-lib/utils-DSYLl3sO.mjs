import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/bbc/utils.tsx
const applyAttributes = (content, attributes) => {
	let result = content;
	const attributeList = attributes ?? [];
	for (const attribute of attributeList) switch (attribute) {
		case "bold":
			result = /* @__PURE__ */ jsx("strong", { children: result });
			break;
		case "italic":
			result = /* @__PURE__ */ jsx("em", { children: result });
			break;
		default: throw new Error(`Unhandled attribute: ${attribute}`);
	}
	return result;
};
const extractText = (blocks) => {
	if (!blocks?.length) return "";
	return blocks.map((block) => {
		if (block.type === "fragment") return block.model?.text ?? "";
		if (block.model?.text) return block.model.text;
		return extractText(block.model?.blocks ?? block.blocks ?? block.items);
	}).join("");
};
const renderInlineBlocks = (blocks) => {
	if (!blocks?.length) return [];
	return blocks.flatMap((block) => {
		if (block.type === "fragment") {
			const text = block.model?.text ?? "";
			if (!text) return [];
			return [applyAttributes(text, block.model?.attributes)];
		}
		if (block.model?.blocks || block.blocks || block.items) return renderInlineBlocks(block.model?.blocks ?? block.blocks ?? block.items);
		if (block.model?.text) return [block.model.text];
		return [];
	});
};
const renderList = (block, key) => {
	const items = block.model?.blocks ?? block.blocks ?? block.items;
	if (!items?.length) return null;
	const listItems = items.map((item, index) => {
		const content = renderInlineBlocks(item.model?.blocks ?? item.blocks ?? item.items);
		const fallback = item.model?.text ? [item.model.text] : [];
		return /* @__PURE__ */ jsx("li", { children: content.length ? content : fallback }, `${key}-item-${index}`);
	});
	const listType = block.model?.listType ?? block.model?.listStyle ?? block.type;
	if (listType === "ordered" || listType === "orderedList") return /* @__PURE__ */ jsx("ol", { children: listItems }, key);
	return /* @__PURE__ */ jsx("ul", { children: listItems }, key);
};
const renderParagraph = (blocks, keyPrefix = "paragraph") => {
	if (!blocks?.length) return [];
	return blocks.flatMap((block, index) => {
		const key = `${keyPrefix}-${index}`;
		switch (block.type) {
			case "paragraph": {
				const content = renderInlineBlocks(block.model?.blocks ?? block.blocks ?? block.items);
				const fallbackText = block.model?.text;
				if (!content.length && !fallbackText) return [];
				return [/* @__PURE__ */ jsx("p", { children: content.length ? content : fallbackText }, key)];
			}
			case "subheading":
			case "heading": return [/* @__PURE__ */ jsx("h2", { children: extractText(block.model?.blocks ?? block.blocks ?? block.items) }, key)];
			case "list":
			case "unorderedList":
			case "orderedList": {
				const list = renderList(block, key);
				return list ? [list] : [];
			}
			default: return renderParagraph(block.model?.blocks ?? block.blocks ?? block.items, key);
		}
	});
};
const findBlocksByType = (blocks, type) => {
	if (!blocks?.length) return [];
	const matches = [];
	for (const block of blocks) {
		if (block.type === type) matches.push(block);
		matches.push(...findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, type));
	}
	return matches;
};
const buildImageUrl = (model) => {
	if (!model?.locator || !model.originCode) return;
	return `https://ichef.bbci.co.uk/news/1536/${model.originCode}/${model.locator}`;
};
const renderFigure = (key, src, altText, width, height, caption, copyrightHolder) => /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
	src,
	alt: altText,
	width,
	height
}), caption || copyrightHolder ? /* @__PURE__ */ jsx("figcaption", { children: [copyrightHolder, caption].filter(Boolean).join(" / ") }) : null] }, key);
const renderImage = (block, index) => {
	const imagePayload = block.model?.image;
	const captionPayload = block.model?.caption;
	if (imagePayload?.src) {
		const caption = extractText(captionPayload?.model?.blocks ?? captionPayload?.blocks ?? captionPayload?.items).trim();
		const altText = imagePayload.alt?.trim() ?? "";
		const copyrightHolder = imagePayload.copyright?.trim();
		return renderFigure(`image-${index}`, imagePayload.src, altText, imagePayload.width, imagePayload.height, caption, copyrightHolder);
	}
	const altTextBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "altText")[0];
	const captionBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "caption")[0];
	const rawImageBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "rawImage")[0];
	const altText = extractText(altTextBlock?.model?.blocks ?? altTextBlock?.blocks ?? altTextBlock?.items).trim();
	const caption = extractText(captionBlock?.model?.blocks ?? captionBlock?.blocks ?? captionBlock?.items).trim();
	const imageModel = rawImageBlock?.model ?? block.model;
	const src = buildImageUrl(imageModel);
	if (!src) return null;
	const copyrightHolder = imageModel?.copyrightHolder?.trim();
	return renderFigure(`image-${index}`, src, altText, imageModel?.width, imageModel?.height, caption, copyrightHolder);
};
const renderVideo = (block, index) => {
	const altTextBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "altText")[0];
	const captionBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "caption")[0];
	const mediaMetadataBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "mediaMetadata")[0];
	const aresMediaBlock = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "aresMedia")[0];
	const aresMediaMetadata = aresMediaBlock ? (aresMediaBlock.model?.blocks ?? aresMediaBlock.blocks ?? aresMediaBlock.items)?.[0] : void 0;
	const altText = extractText(altTextBlock?.model?.blocks ?? altTextBlock?.blocks ?? altTextBlock?.items).trim();
	const caption = extractText(captionBlock?.model?.blocks ?? captionBlock?.blocks ?? captionBlock?.items).trim();
	let src;
	let sourceText;
	if (mediaMetadataBlock?.model?.imageUrl) {
		src = mediaMetadataBlock.model.imageUrl;
		sourceText = mediaMetadataBlock.model.imageCopyright;
	} else if (aresMediaMetadata?.model?.imageUrl) {
		src = `https://${aresMediaMetadata.model.imageUrl.replace("/$recipe/", "/800xn/")}`;
		sourceText = aresMediaMetadata.model.imageCopyright;
	}
	if (!src) return null;
	return renderFigure(`video-${index}`, src, altText, void 0, void 0, caption, sourceText);
};
const renderMedia = (block, index) => {
	const mediaItem = block.model?.media?.items?.[0];
	const holdingImageUrl = mediaItem?.holdingImageUrl;
	if (!holdingImageUrl) return null;
	const caption = extractText(block.model?.caption?.model?.blocks ?? block.model?.caption?.blocks ?? block.model?.caption?.items).trim();
	const altText = mediaItem?.title?.trim() ?? "";
	return renderFigure(`media-${index}`, holdingImageUrl.replace("/$recipe/", "/800xn/"), altText, void 0, void 0, caption);
};
const renderOEmbed = (block, index, keyPrefix = "oembed") => {
	const oembedHtml = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "aresOEmbed")[0]?.model?.oembed?.html ?? block.model?.oembed?.html;
	if (!oembedHtml) return null;
	return /* @__PURE__ */ jsx("div", { children: raw(oembedHtml) }, `${keyPrefix}-${index}`);
};
const renderEmbedImages = (block, index) => {
	const imageBlocks = findBlocksByType(block.model?.blocks ?? block.blocks ?? block.items, "image");
	if (!imageBlocks?.length) return null;
	let largestImage = null;
	let maxWidth = 0;
	for (const imageBlock of imageBlocks) {
		const width = findBlocksByType(imageBlock.model?.blocks ?? imageBlock.blocks ?? imageBlock.items, "rawImage")[0]?.model?.width;
		if (width && width > maxWidth) {
			maxWidth = width;
			largestImage = imageBlock;
		}
	}
	if (!largestImage) return null;
	return renderImage(largestImage, index);
};
const renderBlock = (block, index) => {
	switch (block.type) {
		case "image": return renderImage(block, index);
		case "video": return renderVideo(block, index);
		case "text": return renderParagraph(block.model?.blocks ?? block.blocks ?? block.items, `text-${index}`);
		case "media": return renderMedia(block, index);
		case "subheadline": {
			const text = extractText(block.model?.blocks ?? block.blocks ?? block.items).trim();
			return text ? /* @__PURE__ */ jsx("h2", { children: text }, `subheadline-${index}`) : null;
		}
		case "social": return renderOEmbed(block, index, "social");
		case "oEmbed": return renderOEmbed(block, index);
		case "embedImages": return renderEmbedImages(block, index);
		case "headline":
		case "timestamp":
		case "byline":
		case "advertisement":
		case "embed":
		case "disclaimer":
		case "continueReading":
		case "mpu":
		case "wsoj":
		case "relatedContent":
		case "links":
		case "visuallyHiddenHeadline":
		case "fauxHeadline":
		case "metadata":
		case "topicList":
		case "promoList": return null;
		default: return renderParagraph(block.model?.blocks ?? block.blocks ?? block.items, `block-${index}`);
	}
};
const renderArticleContent = (content) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: content.flatMap((block, index) => renderBlock(block, index)).filter((node) => node !== null) }));
const extractInitialData = ($) => {
	const initialDataText = JSON.parse($("script:contains(\"window.__INITIAL_DATA__\")").text().match(/window\.__INITIAL_DATA__\s*=\s*(\S.*)?;/)?.[1] ?? "\"{}\"");
	return JSON.parse(initialDataText);
};
const extractArticleWithInitialData = ($, item) => {
	if (item.link.includes("/live/") || item.link.includes("/videos/") || item.link.includes("/extra/") || item.link.includes("/sounds/play/")) return { description: item.content };
	const initialData = extractInitialData($);
	if (!initialData || !initialData.data) return { description: item.content };
	const article = Object.values(initialData.data).find((d) => d.name === "article")?.data;
	const topics = Array.isArray(article?.topics) ? article.topics : [];
	const blocks = article?.content?.model?.blocks;
	return {
		category: [.../* @__PURE__ */ new Set([...item.category || [], ...topics.map((t) => t.title)])],
		description: blocks ? renderArticleContent(blocks) : item.content
	};
};
const fetchBbcContent = async (link, item) => {
	const response = await rofetch.raw(link, { retryStatusCodes: [403] });
	const $ = load(response._data);
	const { hostname, pathname } = new URL(response.url);
	switch (true) {
		case hostname === "www.bbc.co.uk":
		case pathname.startsWith("/sport"): return extractArticleWithInitialData($, item);
		case pathname.startsWith("/sounds/play") || pathname.startsWith("/news/live"): return { description: item.content ?? item.description ?? "" };
		case pathname.startsWith("/zhongwen/articles/"): {
			const pageData = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.pageData;
			const metadata = pageData.metadata;
			const aboutLabels = metadata.tags?.about?.map((t) => t.thingLabel) ?? [];
			const topicNames = metadata.topics?.map((t) => t.topicName) ?? [];
			return {
				category: [.../* @__PURE__ */ new Set([...aboutLabels, ...topicNames])],
				description: renderArticleContent(pageData.content.model.blocks)
			};
		}
		case pathname.startsWith("/news/"): {
			const pageProps = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps;
			const articleData = pageProps.page[pageProps.pageKey];
			return {
				category: [.../* @__PURE__ */ new Set([...item.category || [], ...articleData.topics?.map((t) => t.title) ?? []])],
				description: renderArticleContent(articleData.contents)
			};
		}
		default: break;
	}
	const pageProps = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps;
	const articleData = pageProps.page[pageProps.pageKey];
	return { description: renderArticleContent(articleData.contents) };
};
//#endregion
export { fetchBbcContent as n, extractInitialData as t };
