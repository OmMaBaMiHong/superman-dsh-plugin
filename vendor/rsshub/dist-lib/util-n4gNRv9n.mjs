import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gcores/templates/description.tsx
const Description = ({ images, audios, videos, intro, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image, index) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt,
		width: image.width,
		height: image.height
	}) }, `${image.src}-${index}`) : null),
	audios?.map((audio, index) => audio?.src ? /* @__PURE__ */ jsxs("audio", {
		controls: true,
		children: [/* @__PURE__ */ jsx("source", {
			src: audio.src,
			type: audio.type
		}), /* @__PURE__ */ jsx("object", {
			data: audio.src,
			children: /* @__PURE__ */ jsx("embed", { src: audio.src })
		})]
	}, `${audio.src}-${index}`) : null),
	videos?.map((video, index) => video?.src ? video?.type?.endsWith("taptap") ? /* @__PURE__ */ jsx("iframe", {
		src: video.src,
		frameborder: "0",
		allowfullscreen: true
	}, `${video.src}-${index}`) : /* @__PURE__ */ jsxs("video", {
		controls: true,
		children: [/* @__PURE__ */ jsx("source", {
			src: video.src,
			type: video.type
		}), /* @__PURE__ */ jsx("object", {
			data: video.src,
			children: /* @__PURE__ */ jsx("embed", { src: video.src })
		})]
	}, `${video.src}-${index}`) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
//#region lib/routes/gcores/parser.ts
const imageBaseUrl$1 = "https://image.gcores.com";
const STYLES = {
	BOLD: { fontWeight: "bold" },
	CODE: {
		fontFamily: "monospace",
		wordWrap: "break-word"
	},
	ITALIC: { fontStyle: "italic" },
	STRIKETHROUGH: { textDecoration: "line-through" },
	UNDERLINE: { textDecoration: "underline" }
};
const BLOCK_TYPES = {
	"header-one": { element: "h1" },
	"header-two": { element: "h2" },
	"header-three": { element: "h3" },
	"header-four": { element: "h4" },
	"header-five": { element: "h5" },
	"header-six": { element: "h6" },
	"unordered-list-item": {
		element: "li",
		parentElement: "ul"
	},
	"ordered-list-item": {
		element: "li",
		parentElement: "ol"
	},
	blockquote: { element: "blockquote" },
	atomic: { element: void 0 },
	"code-block": { element: "pre" },
	unstyled: { element: "p" }
};
/**
* Creates a styled HTML fragment for a given text and style object.
* @param text - The text content.
* @param style - CSS styles as key-value pairs.
* @returns HTML string with applied styles.
*/
const createStyledFragment = (text, style) => {
	return `<span style="${Object.entries(style).map(([key, value]) => `${key.replaceAll(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`).join("; ")}">${text}</span>`;
};
/**
* Creates an HTML element for a given entity.
* @param entity - The entity to create an element for.
* @param text - The text content of the entity.
* @returns HTML element string.
*/
const createEntityElement = (entity, text) => {
	switch (entity.type) {
		case "EMBED": return entity.data.content.startsWith("http") ? `<a href="${entity.data.content}" target="_blank">${entity.data.content}</a>` : entity.data.content;
		case "IMAGE": return renderDescription({ images: entity.data.path ? [{
			src: new URL(entity.data.path, imageBaseUrl$1).href,
			alt: entity.data.caption,
			width: entity.data.width,
			height: entity.data.height
		}] : void 0 }).replaceAll("\n", "");
		case "GALLERY":
			if (!entity.data.images || !Array.isArray(entity.data.images)) return "";
			return renderDescription({ images: entity.data.images.map((image) => ({
				src: new URL(image.path, imageBaseUrl$1).href,
				alt: image.caption ?? entity.data.caption,
				width: image.width,
				height: image.height
			})) }).replaceAll("\n", "");
		case "LINK": return `<a href="${entity.data.url}" target="_blank">${text}</a>`;
		case "WIDGET": return `<a href="${entity.data.url}" target="_blank">${entity.data.title}</a>`;
		default: return "";
	}
};
/**
* Parses a block into an HTML string with applied styles and entities.
* @param block - The block to parse.
* @param entityMap - The entity map.
* @returns HTML string representing the block.
*/
const parseBlock = (block, entityMap) => {
	const blockType = BLOCK_TYPES[block.type];
	if (!blockType) return "";
	const { text, inlineStyleRanges, entityRanges } = block;
	const combinedRanges = Array.from(inlineStyleRanges, (range) => ({
		...range,
		styles: [STYLES[range.style]],
		entity: null
	}));
	for (const range of entityRanges) combinedRanges.push({
		...range,
		styles: [],
		entity: entityMap[range.key]
	});
	combinedRanges.sort((a, b) => a.offset - b.offset);
	const groupedRangesMap = /* @__PURE__ */ new Map();
	const groupedRanges = [];
	for (const range of combinedRanges) {
		const rangeKey = `${range.offset}-${range.length}`;
		let existingRange = groupedRangesMap.get(rangeKey);
		if (!existingRange) {
			existingRange = {
				offset: range.offset,
				length: range.length,
				styles: [],
				entities: []
			};
			groupedRangesMap.set(rangeKey, existingRange);
			groupedRanges.push(existingRange);
		}
		if (range.styles.length > 0) existingRange.styles.push(...range.styles);
		if (range.entity) existingRange.entities.push(range.entity);
	}
	const resultParts = [];
	let lastOffset = 0;
	for (const range of groupedRanges) {
		resultParts.push(text.slice(lastOffset, range.offset));
		let styledText = text.slice(range.offset, range.offset + range.length);
		if (range.styles.length > 0) {
			const combinedStyle = {};
			for (const style of range.styles) for (const [key, value] of Object.entries(style)) combinedStyle[key] = value;
			styledText = createStyledFragment(styledText, combinedStyle);
		}
		if (range.entities.length > 0) for (const entity of range.entities) styledText = createEntityElement(entity, styledText);
		resultParts.push(styledText);
		lastOffset = range.offset + range.length;
	}
	resultParts.push(text.slice(lastOffset));
	return `${blockType.element ? `<${blockType.element}>` : ""}${resultParts.join("").replaceAll("\n", "<br>")}${blockType.element ? `</${blockType.element}>` : ""}`;
};
/**
* Parses a Content object into an HTML string.
* @param content - The Content object to parse.
* @returns HTML string representing the content.
*/
const parseContent = (content) => {
	const { blocks, entityMap } = content;
	if (!blocks || blocks.length === 0) return "";
	const htmlParts = [];
	let currentParent = void 0;
	let parentContent = [];
	for (const block of blocks) {
		const blockType = BLOCK_TYPES[block.type];
		if (!blockType) continue;
		const parsedBlock = parseBlock(block, entityMap);
		if (blockType.parentElement) if (currentParent === blockType.parentElement) parentContent.push(parsedBlock);
		else {
			if (currentParent) htmlParts.push(`<${currentParent}>${parentContent.join("")}</${currentParent}>`);
			currentParent = blockType.parentElement;
			parentContent = [parsedBlock];
		}
		else {
			if (currentParent) {
				htmlParts.push(`<${currentParent}>${parentContent.join("")}</${currentParent}>`);
				currentParent = void 0;
				parentContent = [];
			}
			htmlParts.push(parsedBlock);
		}
	}
	if (currentParent) htmlParts.push(`<${currentParent}>${parentContent.join("")}</${currentParent}>`);
	return htmlParts.join("");
};
//#endregion
//#region lib/routes/gcores/util.ts
const baseUrl = "https://www.gcores.com";
const imageBaseUrl = "https://image.gcores.com";
const audioBaseUrl = "https://alioss.gcores.com";
const types = /* @__PURE__ */ new Set([
	"radios",
	"articles",
	"news",
	"videos",
	"talks"
]);
const processItems = async (limit, query, apiUrl, targetUrl) => {
	const response = await rofetch(apiUrl, { query: query ?? {
		"page[limit]": limit,
		sort: "-published-at",
		include: "category,user,media",
		"filter[list-all]": 1
	} });
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	const included = response.included;
	const items = [...response.data, ...included].filter((item) => types.has(item.type))?.slice(0, limit).map((item) => {
		const attributes = item.attributes;
		const relationships = item.relationships;
		const title = attributes.title;
		const pubDate = attributes["published-at"];
		const linkUrl = `${item.type}/${item.id}`;
		const categories = [
			relationships?.category?.data,
			relationships?.tag?.data,
			relationships?.topic?.data
		].filter(Boolean).map((obj) => {
			const attributes = included.find((i) => i.type === obj.type && i.id === obj.id)?.attributes;
			return attributes?.name ?? attributes?.title;
		}).filter(Boolean);
		const authorObj = relationships?.user?.data;
		const authorIncluded = authorObj ? included.find((i) => i.type === authorObj.type && i.id === authorObj.id) : void 0;
		const authors = authorIncluded ? [{
			name: authorIncluded.attributes?.nickname,
			url: authorIncluded.id ? new URL(`${authorObj.type}/${authorIncluded.id}`, baseUrl).href : void 0,
			avatar: authorIncluded.thumb ? new URL(authorIncluded.thumb, imageBaseUrl).href : void 0
		}] : void 0;
		const guid = `gcores-${item.id}`;
		const image = attributes.cover ?? attributes.thumb ? new URL(attributes.cover ?? attributes.thumb, imageBaseUrl).href : void 0;
		const updated = pubDate;
		let processedItem = {
			title,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: new URL(linkUrl, baseUrl).href,
			category: categories,
			author: authors,
			guid,
			id: guid,
			image,
			banner: image,
			updated: updated ? parseDate(updated) : void 0,
			language
		};
		let enclosureUrl;
		let enclosureType;
		const mediaAttrs = included.find((i) => i.id === relationships.media?.data?.id)?.attributes;
		if (attributes["speech-path"]) {
			enclosureUrl = new URL(`uploads/audio/${attributes["speech-path"]}`, audioBaseUrl).href;
			enclosureType = `audio/${enclosureUrl?.split(/\./).pop()}`;
		} else if (mediaAttrs) {
			if (mediaAttrs.audio) {
				enclosureUrl = mediaAttrs.audio;
				enclosureType = `audio/${enclosureUrl?.split(/\./).pop()}`;
			} else if (mediaAttrs["original-src"]) {
				enclosureUrl = mediaAttrs["original-src"];
				enclosureType = `video/${enclosureUrl?.split(/\?/).pop() ? /^id=\d+$/.test(enclosureUrl?.split(/\?/).pop()) ? "taptap" : enclosureUrl?.split(/\./).pop() : ""}`;
			}
		}
		if (enclosureUrl) {
			const enclosureLength = attributes.duration ? Number(attributes.duration) : 0;
			processedItem = {
				...processedItem,
				enclosure_url: enclosureUrl,
				enclosure_type: enclosureType,
				enclosure_title: title,
				enclosure_length: enclosureLength,
				itunes_duration: enclosureLength,
				itunes_item_image: image
			};
		}
		const description = renderDescription({
			images: attributes.cover ? [{
				src: new URL(attributes.cover, imageBaseUrl).href,
				alt: title
			}] : void 0,
			audios: enclosureType?.startsWith("audio") && enclosureUrl ? [{
				src: enclosureUrl,
				type: enclosureType
			}] : void 0,
			videos: enclosureType?.startsWith("video") && enclosureUrl ? [{
				src: enclosureUrl,
				type: enclosureType
			}] : void 0,
			intro: attributes.desc || attributes.excerpt,
			description: attributes.content ? parseContent(JSON.parse(attributes.content)) : void 0
		});
		processedItem = {
			...processedItem,
			title: title ?? $(description).text(),
			description,
			content: {
				html: description,
				text: description
			}
		};
		return processedItem;
	});
	const title = $("title").text();
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: title.split(/\|/).pop()?.trim(),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
//#endregion
export { renderDescription as a, parseContent as i, imageBaseUrl as n, processItems as r, baseUrl as t };
