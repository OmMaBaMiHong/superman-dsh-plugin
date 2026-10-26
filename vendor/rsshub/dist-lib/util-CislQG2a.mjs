import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import CryptoJS from "crypto-js";
//#region lib/routes/huxiu/templates/description.tsx
const renderDescription = ({ image, audio, video, preface, summary, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	!video?.src && image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		width: image.width,
		height: image.height
	}) }) : null,
	audio?.src ? /* @__PURE__ */ jsx("audio", {
		controls: true,
		children: /* @__PURE__ */ jsx("source", {
			src: audio.src,
			type: audio.type
		})
	}) : null,
	video?.src ? /* @__PURE__ */ jsxs("video", {
		poster: video.poster || image?.src,
		controls: true,
		children: [/* @__PURE__ */ jsx("source", {
			src: video.src,
			type: video.type
		}), /* @__PURE__ */ jsx("object", {
			data: video.src,
			children: /* @__PURE__ */ jsx("embed", { src: video.src })
		})]
	}) : null,
	preface ? /* @__PURE__ */ jsx(Fragment, { children: raw(preface) }) : null,
	summary ? /* @__PURE__ */ jsx(Fragment, { children: raw(summary) }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
//#endregion
//#region lib/routes/huxiu/util.ts
const domain = "huxiu.com";
const rootUrl = `https://www.${domain}`;
const apiArticleRootUrl = `https://api-web-article.${domain}`;
const apiClubRootUrl = `https://api-ms-web-club.${domain}`;
const apiMemberRootUrl = `https://api-account.${domain}`;
const apiMomentRootUrl = `https://moment-api.${domain}`;
const apiSearchRootUrl = `https://search-api.${domain}`;
const siteTitle = "虎嗅";
/**
* Cleans up HTML data by removing specific elements and attributes.
*
* @param {string} data - The HTML data to clean up.
* @returns {string} - The cleaned up HTML data.
*/
const cleanUpHTML = (data) => {
	const $ = load(data);
	$("div.neirong-shouquan").remove();
	$("em.vote__bar, div.vote__btn, div.vote__time").remove();
	$("p img").each((_, e) => {
		e = $(e);
		if ((e.prop("src") ?? e.prop("_src")) !== void 0) e.parent().replaceWith(renderDescription({ image: {
			src: (e.prop("src") ?? e.prop("_src")).split(/\?/, 1)[0],
			width: e.prop("data-w"),
			height: e.prop("data-h")
		} }));
	});
	$("p, span").each((_, e) => {
		e = $(e);
		if (e.contents().length === 1 && /^\s*$/.test(e.text())) e.remove();
		else {
			e.removeClass();
			e.removeAttr("data-check-id label class");
		}
	});
	$(".text-big-title").each((_, e) => {
		e.tagName = "h3";
		e = $(e);
		e.removeClass();
		e.removeAttr("class");
	});
	$(".text-sm-title").each((_, e) => {
		e.tagName = "h4";
		e = $(e);
		e.removeClass();
		e.removeAttr("class");
	});
	return $.html();
};
const normalizeText = (value) => {
	if (!value) return;
	return load(value).text().trim() || void 0;
};
const buildRouteData = ({ title, link, description, image, icon, subtitle, author }) => ({
	title,
	link,
	description,
	language: "zh-CN",
	image,
	icon,
	logo: icon,
	subtitle: subtitle ?? title,
	author,
	itunes_author: author,
	itunes_category: "News",
	allowEmpty: true
});
const prefixValue = (value, prefix) => {
	if (!value || !prefix) return value;
	return value.startsWith(prefix) ? value : `${prefix}${value}`;
};
const buildHuxiuRouteTitlePrefix = (routeName) => `${siteTitle}${routeName}-`;
const buildFeedMetadata = ({ title, link, description, image, subtitle, author, titlePrefix, descriptionPrefix }) => {
	const baseTitle = title;
	const baseDescription = normalizeText(description) ?? description ?? subtitle ?? title;
	const resolvedTitle = prefixValue(baseTitle, titlePrefix) ?? baseTitle;
	const resolvedDescription = prefixValue(baseDescription, descriptionPrefix) ?? baseDescription;
	return buildRouteData({
		title: resolvedTitle,
		link,
		description: resolvedDescription,
		image,
		icon: image,
		subtitle: subtitle ?? baseTitle,
		author
	});
};
const fetchApiRouteData = async ({ currentUrl, apiUrl, form, mapData }) => {
	const { data: response } = await got_default.post(apiUrl, { form });
	return buildFeedMetadata({
		link: currentUrl,
		...mapData(response.data)
	});
};
/**
* Builds category array from article data.
*
* @param {Object} data - The article data.
* @returns {string[]} - Array of category names.
*/
const buildCategories = (data) => [
	data.video_article_tag,
	data.brief_column?.name,
	data.club_info?.name,
	...data.tags_info?.map((c) => c.name) ?? [],
	...data.relation_info?.channel?.map((c) => c.name) ?? []
].filter(Boolean);
const extractArticleId = (link) => {
	return new URL(link).pathname.match(/^\/article\/(\d+)\.html$/)?.[1];
};
const extractBriefId = (link) => {
	return new URL(link).pathname.match(/^\/brief\/(\d+)\.html$/)?.[1];
};
const fetchArticleDetail = async (aid) => {
	const apiUrl = new URL("web/article/detail", apiArticleRootUrl).href;
	const { data: response } = await got_default.post(apiUrl, { form: {
		platform: "www",
		aid
	} });
	return response.data;
};
const fetchBriefDetail = async (briefId) => {
	const apiUrl = new URL("v1/brief/detail", apiClubRootUrl).href;
	const { data: response } = await got_default.post(apiUrl, { form: {
		platform: "www",
		brief_id: briefId
	} });
	return response.data;
};
const buildBriefCategories = (data) => [
	data.brief_column?.name,
	data.club_info?.name,
	...data.brief?.tags_info?.map((c) => c.name) ?? []
].filter(Boolean);
const buildBriefAuthor = (data) => data.brief?.publisher_list?.map((publisher) => publisher.username).filter(Boolean).join(", ") || data.brief_column?.name;
const fetchMemberData = async (id, type, items, titlePrefix) => {
	const currentUrl = new URL(`member/${id}${type === "article" ? "" : `/${type}`}.html`, rootUrl).href;
	const firstArticleId = items.find((item) => item.aid)?.aid;
	if (firstArticleId) try {
		const detail = await fetchArticleDetail(firstArticleId);
		const username = detail.user_info?.username ?? detail.author;
		const description = detail.user_info?.yijuhua ?? `${username ?? `用户 ${id}`}的${type === "moment" ? "24 小时" : "文章"}`;
		const image = detail.user_info?.avatar?.split(/\?/, 1)[0];
		return buildFeedMetadata({
			title: username ?? `用户 ${id}`,
			link: currentUrl,
			description,
			image,
			author: username,
			titlePrefix
		});
	} catch {}
	return buildFeedMetadata({
		title: `用户 ${id}`,
		link: currentUrl,
		description: `用户 ${id} 的${type === "moment" ? "24 小时" : "文章"}`,
		titlePrefix
	});
};
/**
* Fetches item data.
*
* @param {Object} item - The item to fetch data for.
* @returns {Promise<Object>} The fetched item data object.
*/
const fetchItem = async (item) => {
	const articleId = extractArticleId(item.link);
	const briefId = extractBriefId(item.link);
	if (!articleId && !briefId) return item;
	let data;
	try {
		data = articleId ? await fetchArticleDetail(articleId) : await fetchBriefDetail(briefId);
	} catch {
		return item;
	}
	if (!data) return item;
	if (briefId) {
		const { brief, brief_column: briefColumn, club_info: clubInfo } = data;
		const briefAudioInfo = processAudioInfo(brief.audio_info);
		const audio = briefAudioInfo.processed;
		const audioItem = briefAudioInfo.processedItem ?? {};
		const body = [
			brief.preface,
			brief.content,
			brief.peroration
		].filter(Boolean).join("");
		return {
			...audioItem,
			...item,
			title: brief.title ?? item.title,
			description: renderDescription({
				audio,
				description: body ? cleanUpHTML(body) : void 0
			}),
			author: buildBriefAuthor(data) ?? item.author,
			category: buildBriefCategories({
				brief,
				brief_column: briefColumn,
				club_info: clubInfo
			}),
			pubDate: parseDate(brief.publish_time, "X"),
			upvotes: Number(brief.agree_num ?? item.upvotes ?? 0),
			comments: Number(brief.total_comment_num ?? brief.comment_num ?? item.comments ?? 0)
		};
	}
	const articleAudioInfo = processAudioInfo(data.audio_info);
	const audio = articleAudioInfo.processed;
	const audioItem = articleAudioInfo.processedItem ?? {};
	if (Object.keys(audioItem).length !== 0) audioItem.itunes_item_image = data.pic_path ?? data.share_info?.share_img ?? void 0;
	const { processed: video, processedItem: videoItem = {} } = processVideoInfo(data.video_info);
	const preface = data.content_preface ?? data.preface;
	const content = data.content;
	return {
		...audioItem,
		...videoItem,
		...item,
		title: data.title ?? item.title,
		description: renderDescription({
			image: { src: data.pic_path },
			video,
			audio,
			preface: preface ? cleanUpHTML(preface) : void 0,
			summary: data.summary,
			description: content ? cleanUpHTML(content) : void 0
		}),
		author: data.user_info?.username ?? item.author,
		category: buildCategories(data),
		pubDate: parseDate(data.dateline ?? data.publish_time, "X"),
		upvotes: Number(data.agreenum ?? item.upvotes ?? 0),
		comments: Number(data.commentnum ?? data.total_comment_num ?? item.comments ?? 0)
	};
};
/**
* Generates a random nonce string.
*
* @returns {string} The generated nonce string.
*/
const generateNonce = () => {
	let nonce = "";
	const e = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const t = 16;
	for (let i = 0; i < t; i++) nonce += e.charAt(Math.floor(Math.random() * 62));
	return nonce;
};
/**
* Generates a signature object containing a nonce, timestamp, and signature value.
*
* @returns {string} nonce - The generated nonce.
* @returns {string} timestamp - The timestamp.
* @returns {string} signature - The calculated signature value.
*/
const generateSignature = () => {
	const timestamp = Math.round(Date.now() / 1e3).toString();
	const appSecret = "hUzaABtNfDE-6UiyaYhfsmjW-8dnoyVc";
	const nonce = generateNonce();
	const r = [
		appSecret,
		timestamp,
		nonce
	].toSorted();
	return {
		nonce,
		timestamp,
		signature: CryptoJS.SHA1(r[0] + r[1] + r[2]).toString()
	};
};
const audioQualities = ["", "low"];
/**
* Processes the audio information and returns the processed data.
*
* @param {Object} info - The audio information to process.
* @returns {Object} - An object containing the processed audio data.
*/
const processAudioInfo = (info) => {
	const quality = info ? audioQualities.find((quality) => Object.hasOwn(info, `audio_${quality === "" ? "" : `${quality}_`}path`)) : void 0;
	if (quality === void 0) return {
		processed: void 0,
		processedItem: {}
	};
	const linkKey = `audio_${quality}path`;
	const sizeKey = `audio_${quality}size`;
	const processed = {
		duration: info.format_length_new ?? info.format_length,
		size: Object.hasOwn(info, sizeKey) ? info[sizeKey] : void 0,
		src: info[linkKey],
		type: `audio/${info[linkKey].split(/\./).pop()}`
	};
	return {
		processed,
		processedItem: {
			itunes_duration: processed.duration,
			enclosure_url: processed.src,
			enclosure_length: processed.size,
			enclosure_type: processed.type
		}
	};
};
/**
* Resolves item identifiers (guid and link) based on item type.
*
* @param {Object} item - The item to resolve identifiers for.
* @returns {Object|null} - Object with guid and link, or null if invalid item.
*/
const resolveItemIdentifiers = (item) => {
	if (item.object_type === 8) return {
		guid: `huxiu-moment-${item.object_id}`,
		link: item.url || new URL(`moment/${item.object_id}.html`, rootUrl).href
	};
	if (item.brief_id || /huxiu\.com\/brief\//.test(item.url)) {
		const briefId = item.brief_id ?? item.aid;
		return {
			guid: `huxiu-brief-${briefId}`,
			link: new URL(`brief/${briefId}.html`, rootUrl).href
		};
	}
	if (item.aid) return {
		guid: `huxiu-article-${item.aid}`,
		link: new URL(`article/${item.aid}.html`, rootUrl).href
	};
	return null;
};
/**
* Extracts count information from item.
*
* @param {Object} item - The item to extract counts from.
* @returns {Object} - Object with upvotes, downvotes, and comments.
*/
const extractCounts = (item) => ({
	upvotes: Number(item.count_info?.agree ?? item.count_info?.favtimes ?? item.agree_num ?? 0),
	downvotes: Number(item.count_info?.disagree ?? 0),
	comments: Number(item.count_info?.total_comment_num ?? item.count_info?.commentnum ?? item.total_comment_num ?? item.commentnum ?? 0)
});
/**
* Extracts author from item using various possible fields.
*
* @param {Object} item - The item to extract author from.
* @returns {string|undefined} - The author name or undefined.
*/
const extractAuthor = (item) => item.user_info?.username ?? item.brief_column?.name ?? item.author_info?.username ?? item.author;
/**
* Extracts image source from item.
*
* @param {Object} item - The item to extract image from.
* @returns {string|undefined} - The image URL or undefined.
*/
const extractImageSrc = (item) => item.origin_pic_path ?? item.pic_path ?? item.big_pic_path?.split(/\?/, 1)[0];
/**
* Maps a single item to a processed item object.
*
* @param {Object} item - The raw item to process.
* @returns {Object|string} - The processed item or empty string if invalid.
*/
const mapItem = (item) => {
	const identifiers = resolveItemIdentifiers(item);
	if (!identifiers) return "";
	const mappedAudioInfo = processAudioInfo(item.audio_info);
	const audio = mappedAudioInfo.processed;
	const audioItem = mappedAudioInfo.processedItem ?? {};
	if (Object.keys(audioItem).length !== 0) audioItem.itunes_item_image = item.pic_path ?? item.share_info?.share_img ?? void 0;
	const { processed: video, processedItem: videoItem = {} } = processVideoInfo(item.video_info);
	const counts = extractCounts(item);
	const timestamp = item.publish_time ?? item.dateline;
	return {
		...audioItem,
		...videoItem,
		title: (item.title ?? item.summary ?? item.content)?.replaceAll(/<\/?(?:em|br)?>/g, ""),
		link: identifiers.link,
		description: renderDescription({
			image: { src: extractImageSrc(item) },
			audio,
			video,
			summary: item.summary ?? item.content ?? item.preface
		}),
		author: extractAuthor(item),
		guid: identifiers.guid,
		pubDate: timestamp ? parseDate(timestamp, "X") : void 0,
		...counts
	};
};
/**
* Process the item list and return the resulting array.
*
* @param {Object[]} items - The items to process.
* @param {number} limit - The maximum number of items to process.
* @returns {Promise<Object[]>} - A promise that resolves to an array of processed items.
*/
const processItems = async (items, limit) => {
	const processedItems = items.map((item) => mapItem(item)).filter(Boolean).slice(0, limit);
	return await Promise.all(processedItems.map((item) => cache_default.tryGet(item.guid, async () => {
		const isExternalLink = !new RegExp(domain, "i").test(new URL(item.link).hostname);
		const isMoment = item.guid.startsWith("huxiu-moment");
		if (isExternalLink || isMoment) return item;
		return await fetchItem(item);
	})));
};
const videoQualities = [
	"fhd",
	"fhd_medium",
	"wifi",
	"fhd_low",
	"flow",
	"hd",
	"sd"
];
/**
* Processes the video information and returns the processed data.
*
* @param {Object} info - The video information to process.
* @returns {Object} - An object containing the processed video data.
*/
const processVideoInfo = (info) => {
	const quality = info ? videoQualities.find((quality) => Object.hasOwn(info, `${quality}_link`)) : void 0;
	if (quality === void 0) return {
		processed: void 0,
		processedItem: {}
	};
	const linkKey = `${quality}_link`;
	const sizeKey = `origin_${quality}_size`;
	const processed = {
		duration: info.duration ?? info.origin_duration,
		poster: info.cover ?? info.custom_cover_path ?? info.gif_path,
		size: Object.hasOwn(info, sizeKey) ? info[sizeKey] : void 0,
		src: info[linkKey],
		type: `video/${info[linkKey].split(/\./).pop()}`
	};
	return {
		processed,
		processedItem: {
			itunes_item_image: processed.poster,
			itunes_duration: processed.duration,
			enclosure_url: processed.src,
			enclosure_length: processed.size,
			enclosure_type: processed.type
		}
	};
};
//#endregion
export { apiSearchRootUrl as a, fetchApiRouteData as c, processItems as d, rootUrl as f, apiMomentRootUrl as i, fetchMemberData as l, apiClubRootUrl as n, buildFeedMetadata as o, siteTitle as p, apiMemberRootUrl as r, buildHuxiuRouteTitlePrefix as s, apiArticleRootUrl as t, generateSignature as u };
