import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/dribbble/utils.tsx
const host = "https://dribbble.com";
async function loadContent(link) {
	const $ = load(await rofetch(link));
	const shotData = JSON.parse($("script").text().match(/shotData:\s(\{.+?\}),\n/)?.[1] ?? "{}");
	const shotMedia = $(".media-shot, .main-shot, .block-media-wrapper").toArray().map((element) => {
		const object = $(element);
		object.find("span.cropped-indicator, button").remove();
		object.find("video").each((_, video) => {
			video = $(video);
			if (!video.attr("src") && video.data("src")) {
				video.attr("src", video.data("src"));
				video.removeAttr("data-src");
				video.removeAttr("data-video-small");
				video.removeAttr("data-video-medium");
				video.removeAttr("data-video-large");
			}
		});
		object.find("img").each((_, img) => {
			img = $(img);
			if (img.data("animated-url")) {
				img.attr("src", img.data("animated-url"));
				img.removeAttr("data-animated-url");
				img.removeAttr("srcset");
			}
			if (!img.attr("src") && img.data("src")) {
				img.attr("src", img.data("src").split("?", 1)[0]);
				img.removeAttr("data-src");
			}
			img.attr("src", img.attr("src").split("?", 1)[0]);
			img.removeAttr("srcset");
			img.removeAttr("data-srcset");
		});
		object.find("a").each((_, a) => {
			a = $(a);
			a.removeAttr("data-pswp-srcset");
		});
		return object.html();
	}).join("");
	const shotDescription = $(".shot-description-container");
	const author = `${shotData.shotUser.name}${shotData.shotUser.team.length ? ` for ${shotData.shotUser.team.name}` : ""}`;
	return {
		description: renderShotDescription({
			shotMedia,
			shotData,
			descriptionHtml: shotDescription.length ? shotDescription.html() : void 0
		}),
		pubDate: parseDate(shotData.postedOn),
		author,
		category: shotData.tags
	};
}
const renderShotDescription = ({ shotMedia, shotData, descriptionHtml }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	shotMedia ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(shotMedia), /* @__PURE__ */ jsx("br", {})] }) : null,
	descriptionHtml ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(descriptionHtml), /* @__PURE__ */ jsx("br", {})] }) : null,
	shotData.likesCount ? /* @__PURE__ */ jsxs(Fragment, { children: [
		shotData.likesCount,
		" likes",
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	shotData.savesCount ? /* @__PURE__ */ jsxs(Fragment, { children: [shotData.savesCount, " saves"] }) : null
] }));
function ProcessFeed(list) {
	return Promise.all(list.map((item) => {
		const $ = load(item);
		const itemId = $(item).data("thumbnail-id");
		const guid = new URL(`/shots/${itemId}`, host).href;
		const itemUrl = new URL($(item).find(".shot-thumbnail-link").attr("href"), host).href;
		return cache_default.tryGet(guid, async () => {
			const { description, pubDate, author, category } = await loadContent(itemUrl);
			return {
				title: $(".shot-title").text(),
				link: itemUrl,
				guid,
				description,
				pubDate,
				author,
				category
			};
		});
	}));
}
/**
* Retrieves data from a given URL and processes it.
*
* @param {string} url - The URL to retrieve data from.
* @param {string} title - The title of the data.
* @return {Object} - An object containing the retrieved data and metadata.
*/
const getData = async (url, title) => {
	const $ = load(await rofetch(url));
	const result = await ProcessFeed($("ol.dribbbles.group > li").toArray());
	return {
		title,
		link: url,
		description: $("meta[name=\"description\"]").attr("content"),
		item: result
	};
};
var utils_default = { getData };
//#endregion
export { utils_default as t };
