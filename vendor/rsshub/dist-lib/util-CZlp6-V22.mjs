import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/whu/templates/description.tsx
const renderDescription = ({ description, image, video, attachments }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	description ? raw(description) : null,
	image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt,
		width: image.width
	}) }) : null,
	video ? /* @__PURE__ */ jsx("video", {
		controls: true,
		width: video.width,
		height: video.height,
		children: /* @__PURE__ */ jsx("source", {
			src: video.src,
			type: `video/${video.src.split(".").pop()}`
		})
	}) : null,
	attachments?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("b", { children: "附件" }), /* @__PURE__ */ jsx("ul", { children: attachments.map((attachment) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
		href: attachment.link,
		children: attachment.title
	}) })) })] }) : null
] }));
//#endregion
//#region lib/routes/whu/util.ts
const domain = "whu.edu.cn";
/**
* Process the meta information from the HTML content.
*
* @param {string} text - The HTML content.
* @returns {Object} The meta information extracted from the content.
*/
const processMeta = (text) => {
	const meta = {};
	text.replaceAll(/<meta name="(.*?)" content="(.*?)"/gi, (_, key, value) => {
		meta[key] = value;
	});
	return meta;
};
/**
* Get a specific meta value from the meta object.
*
* @param {Object} metaObject - The meta object.
* @param {string} key        - The key of the meta value to retrieve.
* @returns {string|undefined} The value of the specified meta key, or undefined if not found.
*/
const getMeta = (metaObject, key) => Object.hasOwn(metaObject, key) ? metaObject[key] : void 0;
/**
* Retrieves item details from a given link and updates the item object.
* @param {Object} item    - The item object to be updated.
* @param {string} rootUrl - The root URL of the item's link.
* @returns {Promise<object>} The updated item object.
*/
const getItemDetail = async (item, rootUrl) => {
	try {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		content("p.vsbcontent_img").each((_, el) => {
			const image = content(el).find("img");
			const imageSrc = new URL(image.prop("orisrc"), rootUrl).href;
			content(el).replaceWith(renderDescription({ image: {
				src: imageSrc,
				width: image.prop("width")
			} }));
		});
		content("script[name=\"_videourl\"]").each((_, el) => {
			const video = content(el);
			const videoSrc = new URL(video.prop("vurl").split("?", 1)[0], rootUrl).href;
			video.replaceWith(renderDescription({ video: {
				src: videoSrc,
				width: content(video).prop("vwidth"),
				height: content(video).prop("vheight")
			} }));
		});
		const description = content("div.v_news_content").html();
		content("form[name=\"_newscontent_fromname\"] table").remove();
		const attachments = content("form[name=\"_newscontent_fromname\"] ul li").toArray().map((attachment) => {
			attachment = content(attachment).find("a");
			return {
				title: attachment.text(),
				link: new URL(attachment.prop("href"), rootUrl).href
			};
		});
		const meta = processMeta(detailResponse);
		item.title = getMeta(meta, "ArticleTitle") ?? item.title;
		item.description = renderDescription({
			description,
			attachments
		});
		item.author = getMeta(meta, "ContentSource");
		item.category = getMeta(meta, "Keywords")?.split(" ").filter(Boolean) ?? [];
		item.guid = getMeta(meta, "Url") ?? item.link;
		item.pubDate = getMeta(meta, "PubDate") ? timezone(parseDate(getMeta(meta, "PubDate")), 8) : item.pubDate;
		if (attachments.length > 0) {
			item.enclosure_url = attachments[0].link;
			item.enclosure_type = `application/${attachments[0].title.split(".").pop()}`;
		}
	} catch {}
	return item;
};
/**
* Process items asynchronously.
*
* @param {Array<Object>} items - The array of items to process.
* @param {string} rootUrl      - The root URL.
* @returns {Array<Promise<Object>>} An array of promises that resolve to the processed items.
*/
const processItems = async (items, rootUrl) => await Promise.all(items.map((item) => {
	if (!item.link.includes("whu.edu.cn")) return item;
	return cache_default.tryGet(item.link, async () => await getItemDetail(item, rootUrl));
}));
//#endregion
export { renderDescription as a, processMeta as i, getMeta as n, processItems as r, domain as t };
