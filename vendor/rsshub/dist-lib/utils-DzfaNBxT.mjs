import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/theinitium/utils.ts
const stripLangSuffix = (name) => name.replace(/-zh-hans$/i, "");
const GHOST_API_BASE = "https://production-initium-media.ghost.io/ghost/api/content";
const GHOST_CONTENT_KEY = "a44a0409c222328d39e2c75293";
const CHANNEL_TAG_MAP = {
	latest: "",
	whatsnew: "whatsnew",
	"news-brief": "whatsnew",
	opinion: "opinion",
	international: "international",
	mainland: "mainland",
	hongkong: "hong-kong",
	taiwan: "taiwan",
	technology: "technology",
	feature: "report",
	report: "report",
	"daily-brief": "daily-brief",
	weekly: "weekly"
};
function applyLanguageToTagSlug(tagSlug, language) {
	if (language === "zh-hans") return `${tagSlug}-zh-hans`;
	return tagSlug;
}
async function ghostFetch(endpoint, params = {}) {
	const url = new URL(`${GHOST_API_BASE}/${endpoint}/`);
	url.searchParams.set("key", GHOST_CONTENT_KEY);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	return await rofetch(url.href);
}
async function scrapeFullArticle(url, cookie) {
	try {
		const article = load(await rofetch(url, {
			headers: { Cookie: cookie },
			parseResponse: (txt) => txt
		}))("article");
		if (article.length === 0) return null;
		if (article.find(".gh-post-upgrade-cta").length > 0) return null;
		return article.html();
	} catch (error) {
		logger.warn(`Failed to scrape Initium article: ${url}`, error);
		return null;
	}
}
/**
* Clean Ghost Koenig editor card HTML for RSS consumption.
* Strips kg-* wrapper divs, converts bookmark cards to simple links,
* removes callout markup, etc.
*/
function cleanGhostHtml(html) {
	const $ = load(html, null, false);
	$("a.kg-bookmark-container, a.kg-bookmark-card").each((_, el) => {
		const $el = $(el);
		const href = $el.attr("href") || "";
		const title = $el.find(".kg-bookmark-title").text().trim();
		const desc = $el.find(".kg-bookmark-description").text().trim();
		const replacement = title ? `<p><a href="${href}">${title}</a>${desc ? ` — ${desc}` : ""}</p>` : `<p><a href="${href}">${href}</a></p>`;
		$el.replaceWith(replacement);
	});
	$(".kg-callout-card").each((_, el) => {
		const $el = $(el);
		const text = $el.find(".kg-callout-text").html() || $el.html() || "";
		$el.replaceWith(`<blockquote>${text}</blockquote>`);
	});
	$(".kg-toggle-card").each((_, el) => {
		const $el = $(el);
		const heading = $el.find(".kg-toggle-heading-text").text().trim();
		const content = $el.find(".kg-toggle-content").html() || "";
		$el.replaceWith(`${heading ? `<p><strong>${heading}</strong></p>` : ""}${content}`);
	});
	$(".kg-card").each((_, el) => {
		const $el = $(el);
		$el.replaceWith($el.html() || "");
	});
	$("figure.kg-bookmark-card").each((_, el) => {
		const $el = $(el);
		$el.replaceWith($el.html() || "");
	});
	$("p:contains(\"<!--members-only-->\")").remove();
	return $.html();
}
async function postsToItems(posts) {
	const memberCookie = config.initium?.memberCookie;
	return await Promise.all(posts.map(async (post) => {
		const authors = post.authors?.map((a) => stripLangSuffix(a.name)) ?? [];
		const categories = post.tags?.filter((t) => t.visibility === "public").map((t) => stripLangSuffix(t.name)) ?? [];
		let description = post.html ? cleanGhostHtml(post.html) : post.html;
		if (!post.access && memberCookie) {
			const fullHtml = await cache_default.tryGet(`theinitium:full:${post.slug}`, () => scrapeFullArticle(post.url, memberCookie), config.cache.contentExpire);
			if (fullHtml) description = cleanGhostHtml(fullHtml);
		}
		return {
			title: post.title,
			author: authors.join(", ") || post.primary_author?.name || "",
			category: categories,
			description,
			link: post.url,
			pubDate: parseDate(post.published_at),
			updated: parseDate(post.updated_at),
			guid: post.uuid,
			banner: post.feature_image ?? void 0
		};
	}));
}
const processFeed = async (model, ctx) => {
	const type = ctx.req.param("type") ?? "latest";
	const language = ctx.req.param("language") ?? "";
	let filter = "";
	let listLink = "";
	let feedName = "";
	switch (model) {
		case "channel": {
			const baseTag = CHANNEL_TAG_MAP[type] ?? type;
			if (baseTag === "") {
				if (language === "zh-hans" || language === "zh-hant") filter = `tag:hash-${language}`;
			} else filter = `tag:${language ? applyLanguageToTagSlug(baseTag, language) : baseTag}`;
			listLink = type === "latest" ? "https://theinitium.com/latest/" : `https://theinitium.com/tag/${baseTag}/`;
			feedName = type;
			break;
		}
		case "tags":
			filter = `tag:${language ? applyLanguageToTagSlug(type, language) : type}`;
			listLink = `https://theinitium.com/tag/${type}/`;
			feedName = type;
			break;
		case "author":
			filter = `author:${language === "zh-hans" ? `${type}-zh-hans` : type}`;
			listLink = `https://theinitium.com/author/${type}/`;
			feedName = type;
			break;
		default: throw new InvalidParameterError(`Unsupported model: ${model}`);
	}
	const cacheKey = `theinitium:ghost:${model}:${type}:${language}`;
	const data = await cache_default.tryGet(cacheKey, async () => {
		const params = {
			include: "tags,authors",
			limit: "20"
		};
		if (filter) params.filter = filter;
		return await ghostFetch("posts", params);
	}, config.cache.routeExpire, false);
	const items = await postsToItems(data.posts);
	let displayName = feedName;
	if (data.posts.length > 0) switch (model) {
		case "channel": {
			const baseTag = CHANNEL_TAG_MAP[type] ?? type;
			if (baseTag) {
				const langTag = language === "zh-hans" ? `${baseTag}-zh-hans` : baseTag;
				const matchedTag = data.posts[0].tags?.find((t) => t.slug === langTag || t.slug === baseTag);
				if (matchedTag) displayName = stripLangSuffix(matchedTag.name);
			} else displayName = "最新";
			break;
		}
		case "tags": {
			const langTag = language === "zh-hans" ? `${type}-zh-hans` : type;
			const matchedTag = data.posts[0].tags?.find((t) => t.slug === langTag || t.slug === type);
			if (matchedTag) displayName = stripLangSuffix(matchedTag.name);
			break;
		}
		case "author": {
			const authorSlug = language === "zh-hans" ? `${type}-zh-hans` : type;
			const matchedAuthor = data.posts[0].authors?.find((a) => a.slug === authorSlug || a.slug === type);
			if (matchedAuthor) displayName = stripLangSuffix(matchedAuthor.name);
			break;
		}
		default:
	}
	return {
		title: `端傳媒 - ${displayName}`,
		link: listLink,
		icon: "https://theinitium.com/favicon.ico",
		language: language === "zh-hans" ? "zh-CN" : "zh-TW",
		item: items
	};
};
//#endregion
export { processFeed as a, postsToItems as i, applyLanguageToTagSlug as n, ghostFetch as r, CHANNEL_TAG_MAP as t };
