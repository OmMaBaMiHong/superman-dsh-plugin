import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/newslaundry/utils.tsx
const rootUrl = "https://www.newslaundry.com";
async function fetchCollection(collectionSlug, customUrl, skipFirstItem = false) {
	const apiUrl = `${rootUrl}/api/v1/collections/${collectionSlug}`;
	const currentUrl = customUrl || `https://www.newslaundry.com/${collectionSlug}`;
	const response = await rofetch(apiUrl);
	if (!response.items || !response.items.length) throw new Error("No articles found");
	const items = (skipFirstItem ? response.items.slice(1) : response.items).map((item) => processStory(item.story));
	return {
		title: `${response.name} - Newslaundry`,
		description: response.summary || `${response.name} articles from Newslaundry`,
		link: currentUrl,
		item: items,
		language: "en",
		logo: `${rootUrl}/favicon.ico`,
		icon: `${rootUrl}/favicon.ico`
	};
}
function processStory(story) {
	const articleUrl = story.url;
	const pubDate = story["published-at"] ? parseDate(story["published-at"]) : null;
	const heroImage = story["hero-image-s3-key"] ? `https://media.assettype.com/${story["hero-image-s3-key"]}?auto=format%2Ccompress&fit=max&dpr=1.0&format=webp` : null;
	const elements = story.cards?.flatMap((card) => card?.["story-elements"]?.map((element) => {
		if (element.type === "text" && element.text) return {
			type: "text",
			text: element.text
		};
		if (element.type === "image" && element["image-s3-key"]) return {
			type: "image",
			url: `https://media.assettype.com/${element["image-s3-key"]}?auto=format%2Ccompress&format=webp`,
			alt: element["alt-text"] || "",
			title: element.title || ""
		};
		if (element.type === "jsembed" && element["embed-js"]) try {
			return {
				type: "jsembed",
				content: Buffer.from(element["embed-js"], "base64").toString()
			};
		} catch {
			return null;
		}
		if (element.type === "youtube-video" && element.url) return {
			type: "youtube-video",
			url: element.url,
			embedUrl: element["embed-url"] || ""
		};
		return null;
	}).filter(Boolean) || []) || [];
	const heroCaption = story["hero-image-caption"] || "";
	const heroAttribution = story["hero-image-attribution"];
	const content = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		story.subheadline ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: story.subheadline }) }) : null,
		heroImage ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
			src: heroImage,
			alt: story["hero-image-alt-text"] || ""
		}), /* @__PURE__ */ jsx("figcaption", { children: heroAttribution ? `${heroCaption} (${heroAttribution})` : heroCaption })] }) : null,
		elements.map((element) => {
			if (element.type === "text") return raw(element.text);
			if (element.type === "image") return /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
				src: element.url,
				alt: element.alt
			}), /* @__PURE__ */ jsx("figcaption", { children: element.title })] });
			if (element.type === "jsembed") return raw(element.content);
			if (element.type === "youtube-video") return /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("iframe", {
				width: "560",
				height: "315",
				src: element.embedUrl,
				frameBorder: "0",
				allowFullScreen: true
			}), /* @__PURE__ */ jsx("figcaption", { children: /* @__PURE__ */ jsx("a", {
				href: element.url,
				target: "_blank",
				rel: "noopener noreferrer",
				children: "Watch on YouTube"
			}) })] });
			return null;
		})
	] }));
	const authors = story.authors?.map((author) => ({
		name: author.name,
		url: author.slug ? `https://www.newslaundry.com/author/${author.slug}` : void 0
	})) || [];
	return {
		title: story.headline,
		link: articleUrl,
		image: heroImage,
		description: content || story.subheadline,
		pubDate,
		updated: story["last-correction-published-at"] ? parseDate(story["last-correction-published-at"]) : void 0,
		author: authors.length > 0 ? authors : story["author-name"],
		category: story.tags?.map((tag) => tag.name) || []
	};
}
//#endregion
export { rootUrl as n, fetchCollection as t };
