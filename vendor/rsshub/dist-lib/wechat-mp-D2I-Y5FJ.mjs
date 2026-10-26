import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/utils/wechat-mp.ts
var WeChatMpError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "WeChatMpError";
	}
};
const MAINTAINERS = ["@Rongronggg9"];
const formatLogNoMention = (...params) => `wechat-mp: ${params.join(": ")}`;
const formatLog = (...params) => `${formatLogNoMention(...params)}
Consider raise an issue (mentioning ${MAINTAINERS.join(", ")}) with the article URL for further investigation`;
let warn = (...params) => logger.warn(formatLog(...params));
const error = (...params) => {
	const msg = formatLog(...params);
	logger.error(msg);
	throw new WeChatMpError(msg);
};
const errorNoMention = (...params) => {
	const msg = formatLogNoMention(...params);
	logger.error(msg);
	throw new WeChatMpError(msg);
};
(() => {
	const onFunc = (...params) => error("WarningAsError", ...params);
	const offFunc = warn;
	return (on) => {
		warn = on ? onFunc : offFunc;
	};
})();
const replaceReturnNewline = (() => {
	const returnRegExp = /\r|\\(r|x0d)/g;
	const newlineRegExp = /\n|\\(n|x0a)/g;
	return (text, replaceReturnWith = "", replaceNewlineWith = "<br>") => text.replaceAll(returnRegExp, () => replaceReturnWith).replaceAll(newlineRegExp, () => replaceNewlineWith);
})();
const fixUrl = (() => {
	const ampRegExp = /(&|\\x26)amp;/g;
	return (text) => text.replaceAll(ampRegExp, "&");
})();
var LoopContinue = class extends Error {
	constructor() {
		super("");
		this.name = "LoopContinue";
	}
};
var LoopReturn = class extends Error {
	to_return;
	constructor(to_return) {
		super("");
		this.name = "LoopReturn";
		this.to_return = to_return;
	}
};
const forEachScript = ($, callback, defaultReturn = null, selector = "script[nonce][type=\"text/javascript\"]") => {
	const scripts = typeof $ === "string" ? [$] : $(selector).toArray();
	for (const script of scripts) try {
		callback(script);
	} catch (error) {
		if (error instanceof LoopReturn) return error.to_return;
		if (error instanceof LoopContinue) continue;
		throw error;
	}
	return defaultReturn;
};
const showTypeMapReverse = Object.fromEntries(Object.entries({
	APP_MSG_PAGE: "0",
	VIDEO_SHARE_PAGE: "5",
	MUSIC_SHARE_PAGE: "6",
	AUDIO_SHARE_PAGE: "7",
	IMG_SHARE_PAGE: "8",
	TEXT_SHARE_PAGE: "10",
	SHORT_CONTENT_PAGE: "17"
}).map(([k, v]) => [v, k]));
var ExtractMetadata = class {
	static genAssignmentRegExp = (varName, valuePattern, assignPattern) => new RegExp(String.raw`\b${varName}\s*${assignPattern}\s*(?<quote>["'])(?<value>${valuePattern})\k<quote>`, "gm");
	static genExtractFunc = (varName, { valuePattern = String.raw`\w+`, assignPattern = "=", allowNotFound = false, multiple = false }) => {
		const regExp = this.genAssignmentRegExp(varName, valuePattern, assignPattern);
		return (str) => {
			const values = [];
			for (const match of str.matchAll(regExp)) {
				const value = match.groups?.value;
				if (!multiple) return value;
				values.push(value);
			}
			if (!allowNotFound && values.length === 0) throw new LoopContinue();
			return multiple ? values : null;
		};
	};
	static doExtract = (metadataToBeExtracted, scriptText) => {
		const metadataExtracted = {};
		for (const [key, extractFunc] of Object.entries(metadataToBeExtracted)) metadataExtracted[key] = extractFunc(scriptText);
		metadataExtracted._extractedFrom = scriptText;
		return metadataExtracted;
	};
	static commonMetadataToBeExtracted = {
		showType: this.genExtractFunc("item_show_type", {
			valuePattern: String.raw`\d+`,
			allowNotFound: true
		}),
		realShowType: this.genExtractFunc("real_item_show_type", { valuePattern: String.raw`\d+` }),
		createTime: this.genExtractFunc("ct", {
			valuePattern: String.raw`\d+`,
			allowNotFound: true
		}),
		sourceUrl: this.genExtractFunc("msg_source_url", {
			valuePattern: `https?://[^'"]*`,
			allowNotFound: true
		})
	};
	static showTypeMetadataToBeExtracted = { showType: this.genExtractFunc("item_show_type", { valuePattern: String.raw`\d+` }) };
	static common = ($) => {
		const metadataExtracted = forEachScript($, (script) => {
			const scriptText = $(script).text();
			throw new LoopReturn(this.doExtract(this.commonMetadataToBeExtracted, scriptText));
		}, {}, "script[nonce][type=\"text/javascript\"]:contains(\"real_item_show_type\")");
		if (!metadataExtracted.showType) {
			const showTypeExtracted = forEachScript($, (script) => {
				const scriptText = $(script).text();
				throw new LoopReturn(this.doExtract(this.showTypeMetadataToBeExtracted, scriptText));
			}, {}, "script[nonce][type=\"text/javascript\"]:contains(\"item_show_type\")");
			if (showTypeExtracted.showType) metadataExtracted.showType = showTypeExtracted.showType;
		}
		const showType = showTypeMapReverse[metadataExtracted.showType];
		const realShowType = showTypeMapReverse[metadataExtracted.realShowType];
		if (metadataExtracted.sourceUrl) metadataExtracted.sourceUrl = fixUrl(metadataExtracted.sourceUrl);
		if (showType) metadataExtracted.showType = showType;
		else warn("showType not found", `item_show_type=${metadataExtracted.showType}`);
		if (realShowType) metadataExtracted.realShowType = realShowType;
		else warn("realShowType not found", `real_item_show_type=${metadataExtracted.realShowType}`);
		if (metadataExtracted.showType !== metadataExtracted.realShowType) warn("showType mismatch", `item_show_type=${metadataExtracted.showType}, real_item_show_type=${metadataExtracted.realShowType}`);
		return metadataExtracted;
	};
	static audioMetadataToBeExtracted = {
		voiceId: this.genExtractFunc("voiceid", { assignPattern: ":" }),
		duration: this.genExtractFunc("duration", {
			valuePattern: String.raw`\d*`,
			assignPattern: ":",
			allowNotFound: true
		})
	};
	static audio = ($) => forEachScript($, (script) => {
		const scriptText = $(script).text();
		throw new LoopReturn(this.doExtract(this.audioMetadataToBeExtracted, scriptText));
	}, {}, "script[nonce][type=\"text/javascript\"]:contains(\"voiceid\")");
	static imgMetadataToBeExtracted = { imgUrls: this.genExtractFunc("cdn_url", {
		valuePattern: `https?://[^'"]*`,
		assignPattern: ":",
		multiple: true
	}) };
	static img = ($) => forEachScript($, (script) => {
		const scriptText = $(script).text();
		const metadataExtracted = this.doExtract(this.imgMetadataToBeExtracted, scriptText);
		if (Array.isArray(metadataExtracted.imgUrls)) metadataExtracted.imgUrls = metadataExtracted.imgUrls.map((url) => fixUrl(url));
		throw new LoopReturn(metadataExtracted);
	}, {}, "script[nonce][type=\"text/javascript\"]:contains(\"picture_page_info_list\")");
	static locationMetadataToBeExtracted = {
		countryName: this.genExtractFunc("countryName", {
			valuePattern: `[^'"]*`,
			assignPattern: ":"
		}),
		provinceName: this.genExtractFunc("provinceName", {
			valuePattern: `[^'"]*`,
			assignPattern: ":"
		}),
		cityName: this.genExtractFunc("cityName", {
			valuePattern: `[^'"]*`,
			assignPattern: ":"
		})
	};
	static location = ($) => forEachScript($, (script) => {
		const scriptText = $(script).text();
		throw new LoopReturn(this.doExtract(this.locationMetadataToBeExtracted, scriptText));
	}, {}, "script[nonce][type=\"text/javascript\"]:contains(\"countryName\")");
};
const replaceTag = ($, oldTag, newTagName) => {
	oldTag = $(oldTag);
	const NewTag = $($(`<${newTagName} />`));
	const oldTagAttr = oldTag.attr();
	for (const key in oldTagAttr) NewTag.attr(key, oldTagAttr[key]);
	NewTag.append(oldTag.contents());
	oldTag.replaceWith(NewTag);
};
const detectOriginalArticleUrl = ($) => {
	if (!$("#js_content").text()) return $("#js_share_source").attr("data-url");
	if ($("#js_content").text().length < 80) return $("#js_content a").attr("href");
	return null;
};
const genAudioSrc = (voiceId) => `https://res.wx.qq.com/voice/getvoice?mediaid=${voiceId}`;
const genAudioTag = (src, title) => `<audio controls src="${src}" title="${title}" style="width:100%"/>`;
const genVideoSrc = (videoId) => {
	return `https://v.qq.com/txp/iframe/player.html?${new URLSearchParams({
		origin: "https://mp.weixin.qq.com",
		containerId: "js_tx_video_container_0.3863487104715233",
		vid: videoId,
		width: "677",
		height: "380.8125",
		autoplay: "false",
		allowFullScreen: "true",
		chid: "17",
		full: "true",
		show1080p: "false",
		isDebugIframe: "false"
	}).toString()}`;
};
/**
* Articles from WeChat MP have weird formats, this function is used to fix them.
*
* Even though your content are not directly fetched from WeChat MP, you SHOULD still call this function.
* Calling this function is safe in most situations.
*
* Example usage: item.description = fixArticleContent($('div#js_content.rich_media_content'));
* @param {*} html - The html to be fixed, a string or a cheerio object.
* @param {boolean} skipImg - Whether to skip fixing images.
* @return {string} - The fixed html, a string.
*/
const fixArticleContent = (html, skipImg = false) => {
	let htmlResult = "";
	if (typeof html === "string") htmlResult = html;
	else if (html?.html) htmlResult = html.html() || "";
	if (!htmlResult) return "";
	const $ = load(htmlResult, void 0, false);
	if (!skipImg) $("img[data-src]").each((_, img) => {
		const $img = $(img);
		const realSrc = $img.attr("data-src");
		if (realSrc) {
			$img.attr("src", realSrc);
			$img.removeAttr("data-src");
		}
	});
	$("mpvoice[voice_encode_fileid]").each((_, voice) => {
		const $voice = $(voice);
		const voiceId = $voice.attr("voice_encode_fileid");
		if (voiceId) {
			const title = $voice.attr("name") || "Audio";
			$voice.replaceWith(genAudioTag(genAudioSrc(voiceId), title));
		}
	});
	$("iframe.video_iframe[data-src]").each((_, iframe) => {
		const $iframe = $(iframe);
		const dataSrc = $iframe.attr("data-src");
		const srcUrlObj = new URL(dataSrc);
		if (srcUrlObj.host === "v.qq.com" && srcUrlObj.searchParams.has("vid")) {
			const newSrc = genVideoSrc(srcUrlObj.searchParams.get("vid"));
			$iframe.attr("src", newSrc);
			$iframe.removeAttr("data-src");
			const width = $iframe.attr("data-w");
			const ratio = $iframe.attr("data-ratio");
			if (width && ratio) {
				const width_ = Math.min(Number.parseInt(width), 677);
				$iframe.attr("width", width_.toString());
				$iframe.attr("height", (width_ / Number(ratio)).toString());
			}
		}
	});
	$("section").each((_, section) => {
		const $section = $(section);
		const p_count = $section.find("p").length;
		const div_count = $section.find("div").length;
		const section_count = $section.find("section").length;
		if (p_count + div_count + section_count === 0) replaceTag($, section, "p");
		else replaceTag($, section, "div");
	});
	$("code").each((_, code) => {
		$("<br>").insertAfter(code);
	});
	$(".code-snippet__line-index").remove();
	$("script").remove();
	return $.html();
};
const normalizeUrl = (url, bypassHostCheck = false) => {
	const oriUrl = url;
	url = fixUrl(url);
	const urlObj = new URL(url);
	if (!bypassHostCheck && urlObj.host !== "mp.weixin.qq.com") error("URL host must be \"mp.weixin.qq.com\"", url);
	urlObj.protocol = "https:";
	urlObj.hash = "";
	if (urlObj.pathname.startsWith("/s/")) urlObj.search = "";
	else if (urlObj.pathname === "/s") {
		const biz = urlObj.searchParams.get("__biz");
		const mid = urlObj.searchParams.get("mid") || urlObj.searchParams.get("appmsgid");
		const idx = urlObj.searchParams.get("idx") || urlObj.searchParams.get("itemidx");
		const sn = urlObj.searchParams.get("sn") || urlObj.searchParams.get("sign");
		if (biz && mid && idx && sn) urlObj.search = `?__biz=${biz}&mid=${mid}&idx=${idx}&sn=${sn}`;
		else {
			const src = urlObj.searchParams.get("src");
			const timestamp = urlObj.searchParams.get("timestamp");
			const ver = urlObj.searchParams.get("ver");
			const signature = urlObj.searchParams.get("signature");
			if (src && timestamp && ver && signature) urlObj.search = `?src=${src}&timestamp=${timestamp}&ver=${ver}&signature=${signature}`;
			else warn("unknown URL search parameters", oriUrl);
		}
	} else warn("unknown URL path", oriUrl);
	return urlObj.href;
};
var PageParsers = class PageParsers {
	static common = ($, commonMetadata) => {
		const title = replaceReturnNewline($("meta[property=\"og:title\"]").attr("content") || "", "", " ");
		const author = replaceReturnNewline($("meta[name=author]").attr("content") || "", "", " ");
		const pubDate = commonMetadata.createTime ? parseDate(Number.parseInt(commonMetadata.createTime) * 1e3) : void 0;
		const mpName = $(".wx_follow_nickname").first().text()?.trim();
		let summary = replaceReturnNewline($("meta[name=description]").attr("content") || "");
		const description = summary;
		summary = summary.replaceAll("<br>", " ") === title ? "" : summary;
		return {
			title,
			author,
			description,
			summary,
			pubDate,
			mpName
		};
	};
	static appMsg = async ($, commonMetadata) => {
		const page = PageParsers.common($, commonMetadata);
		page.description = fixArticleContent($("#js_content"));
		const originalArticleUrl = detectOriginalArticleUrl($);
		if (originalArticleUrl) {
			const original$ = load(await rofetch(normalizeUrl(originalArticleUrl)));
			page.description += fixArticleContent(original$("#js_content"));
		}
		return page;
	};
	static img = ($, commonMetadata) => {
		const page = PageParsers.common($, commonMetadata);
		const imgUrls = ExtractMetadata.img($)?.imgUrls;
		let imgHtml = "";
		if (Array.isArray(imgUrls) && imgUrls.length > 0) for (const imgUrl of imgUrls) imgHtml += `<br><br><img src="${imgUrl}" />`;
		page.description += imgHtml;
		return page;
	};
	static audio = ($, commonMetadata) => {
		const page = PageParsers.common($, commonMetadata);
		const audioMetadata = ExtractMetadata.audio($);
		const audioUrl = genAudioSrc(audioMetadata.voiceId);
		page.enclosure_url = audioUrl;
		page.itunes_duration = audioMetadata.duration;
		page.enclosure_type = "audio/mp3";
		page.description += "<br><br>" + genAudioTag(audioUrl, page.title);
		return page;
	};
	static fallback = ($, commonMetadata) => {
		const page = PageParsers.common($, commonMetadata);
		const image = $("meta[property=\"og:image\"]").attr("content");
		if (image) page.description += `<br><br><img src="${image}" />`;
		return page;
	};
	static dispatch = async (html, url) => {
		const $ = load(html);
		const commonMetadata = ExtractMetadata.common($);
		let page;
		let pageText, pageTextShort;
		switch (commonMetadata.showType) {
			case "APP_MSG_PAGE":
				page = await PageParsers.appMsg($, commonMetadata);
				break;
			case "AUDIO_SHARE_PAGE":
				page = PageParsers.audio($, commonMetadata);
				break;
			case "IMG_SHARE_PAGE":
				page = PageParsers.img($, commonMetadata);
				break;
			case "VIDEO_SHARE_PAGE":
				page = PageParsers.fallback($, commonMetadata);
				break;
			case void 0:
				$("script, style").remove();
				pageText = $("title, body").text().replaceAll(/\s+/g, " ").trim();
				pageTextShort = pageText.slice(0, 25);
				if (pageText.length >= 28) {
					pageTextShort = pageText.slice(0, 25);
					pageTextShort += "...";
				}
				if (pageText.includes("已被发布者删除")) errorNoMention("deleted by author", pageTextShort, url);
				else if (new URL(url).pathname.includes("captcha") || pageText.includes("环境异常")) errorNoMention("request blocked by WAF", pageTextShort, url);
				else error("unknown page, probably due to WAF", pageTextShort, url);
				/* v8 ignore next */
				return {};
			default:
				warn("new showType, trying fallback method", `showType=${commonMetadata.showType}`, url);
				page = PageParsers.fallback($, commonMetadata);
		}
		const locationMetadata = ExtractMetadata.location($);
		let location = "";
		for (const loc of [
			locationMetadata.countryName,
			locationMetadata.provinceName,
			locationMetadata.cityName
		]) if (loc) location += loc + " ";
		location = location.trim();
		if (location) page.description += `<p>📍发表于：${location}</p>`;
		if (commonMetadata.sourceUrl) page.description += `<p><a href="${commonMetadata.sourceUrl}">🔗️ 阅读原文</a></p>`;
		return page;
	};
};
const redirectHelper = async (url, maxRedirects = 5) => {
	const raw = await rofetch.raw(url, { redirect: "manual" });
	if ([
		301,
		302,
		303,
		307,
		308
	].includes(raw.status)) {
		const location = raw.headers.get("location");
		if (!location) error("redirect without location", url);
		else if (maxRedirects <= 1) error("too many redirects", url);
		return await redirectHelper(new URL(location, url).href, maxRedirects - 1);
	}
	return raw;
};
/**
* Fetch article and its metadata from WeChat MP (mp.weixin.qq.com).
*
* If you use this function, no need to call `fixArticleContent`
* @param url - The url of the article.
* @param bypassHostCheck - Whether to bypass host check.
* @return - An object containing the article and its metadata.
*/
const fetchArticle = (url, bypassHostCheck = false) => {
	url = normalizeUrl(url, bypassHostCheck);
	return cache_default.tryGet(url, async () => {
		const raw = await redirectHelper(url);
		return {
			...await PageParsers.dispatch(raw._data, raw.url),
			link: url
		};
	});
};
/**
* Fetch article and its metadata from WeChat MP (mp.weixin.qq.com), then fill the `item` object with the result.
*
* If you use this function, no need to call `fetchArticle` or `fixArticleContent`
*
* A new route SHOULD use this function instead of manually calling the above functions
*
* An existing route adopting this function SHOULD either:
* - set `skipLink` to true (not recommended)
* - set `item.guid` to `item.link` BEFORE calling this function
* @param {object} ctx - The context object.
* @param {object} item - The item object to be filled.
* @param {boolean} setMpNameAsAuthor - If `true`, `author` will be the MP itself, otherwise the real author of the article.
* @param {boolean} skipLink - Whether to skip overriding `item.link` with the normalized url.
* @return {Promise<object>} - The incoming `item` object, with the article and its metadata filled in.
*/
const finishArticleItem = async (item, setMpNameAsAuthor = false, skipLink = false) => {
	const fetchedItem = await fetchArticle(item.link);
	for (const key in fetchedItem) switch (key) {
		case "author":
			item.author = setMpNameAsAuthor ? fetchedItem.mpName || item.author : fetchedItem.author || item.author;
			break;
		case "link":
			item.link = skipLink ? item.link : fetchedItem.link || item.link;
			break;
		default: item[key] ||= fetchedItem[key];
	}
	return item;
};
//#endregion
export { fixArticleContent as i, fetchArticle as n, finishArticleItem as r, WeChatMpError as t };
