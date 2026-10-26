import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/xinpianchang/util.tsx
const appKey = "61a2f329348b3bf77";
const domain = "xinpianchang.com";
const rootUrl = `https://www.${domain}`;
const rootApiUrl = `https://mod-api.${domain}`;
const renderDescription = (content, cover, enclousure) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [content ? /* @__PURE__ */ jsx("p", { children: content }) : null, enclousure ? /* @__PURE__ */ jsx("video", {
	controls: true,
	poster: cover,
	children: /* @__PURE__ */ jsx("source", {
		src: enclousure.url ?? enclousure.backupUrl,
		type: enclousure.mime
	})
}) : null] }));
/**
* Retrieves information from a given URL.
*
* @param {string} url - The URL to fetch information from.
* @returns {Promise<Object>} - A Promise that resolves to an object containing the retrieved information.
*/
const getData = (url) => cache_default.tryGet(url, async () => {
	const { data: response } = await got_default(url);
	const $ = load(response);
	const icon = new URL("favicon.ico", rootUrl).href;
	const author = $("meta[property=\"og:site_name\"]").prop("content");
	return {
		data: {
			title: $("span.bg-clip-text").text() || `${author}·${$("meta[property=\"og:title\"]").prop("content").split("-", 1)[0]}`,
			link: url,
			description: $("meta[property=\"og:description\"]").prop("content"),
			language: $("html").prop("lang"),
			image: $("meta[property=\"og:image\"]").prop("content"),
			icon,
			logo: icon,
			subtitle: $("meta[property=\"og:description\"]").prop("content"),
			author,
			itunes_author: author,
			itunes_category: "TV &amp Film",
			allowEmpty: true
		},
		response
	};
});
/**
* Process items asynchronously.
*
* @param {Array<Object>} items - The array of items to process.
* @returns {Promise<Array<Object>>} Returns a Promise that resolves to an array of processed items.
*/
const processItems = async (items) => {
	items = items.map((item) => ({
		title: item.title,
		link: item.web_url,
		description: item.content,
		author: item.author.userinfo.username,
		category: item.categories.flatMap((c) => [c.category_name, c.sub?.category_name]).filter(Boolean),
		guid: `xinpianchang-${item.id}`,
		pubDate: parseDate(item.publish_time * 1e3),
		itunes_item_image: item.cover,
		itunes_duration: item.duration,
		enclosure_url: item.video_library_id,
		upvotes: item.count.count_liked ?? item.count.count_like,
		comments: item.count.count_comment ?? 0
	}));
	return await Promise.all(items.map((item) => cache_default.tryGet(item.guid, async () => {
		const apiUrl = new URL(`mod/api/v2/media/${item.enclosure_url}?appKey=${appKey}`, rootApiUrl).href;
		const { data: detailResponse } = await got_default(apiUrl);
		const data = detailResponse.data;
		const enclousure = data.resource?.progressive ? data.resource.progressive[0] : void 0;
		item.title = data.title ?? item.title;
		item.description = renderDescription(item.description, data.cover ?? item.itunes_item_image, enclousure);
		item.author = data.owner.username ?? item.author;
		item.category = [.../* @__PURE__ */ new Set([
			...item.category,
			...data.categories ?? [],
			...data.keywords ?? []
		])];
		item.itunes_item_image = data.cover ?? item.itunes_item_image;
		item.itunes_duration = data.duration ?? item.itunes_duration;
		if (enclousure) {
			item.enclosure_url = enclousure.url ?? enclousure.backupUrl;
			item.enclosure_length = enclousure.filesize;
			item.enclosure_type = enclousure.mime;
		}
		return item;
	})));
};
//#endregion
export { processItems as n, rootUrl as r, getData as t };
