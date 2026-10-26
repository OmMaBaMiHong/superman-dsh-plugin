import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/dw/utils.tsx
const formatId = "605";
const i18n = (word, lang) => {
	switch (word) {
		case "Image": switch (lang) {
			case "sq": return "Fotografi";
			case "am": return "ምስል";
			case "ar": return "صورة من";
			case "bn": return "ছবি";
			case "bs": return "Foto";
			case "bg": return "Снимка";
			case "zh": return "图像来源";
			case "zh-hant": return "圖片來源";
			case "hr": return "Foto";
			case "fa-af": return "عکس";
			case "en": return "Image";
			case "fr": return "Image";
			case "de": return "Bild";
			case "el": return "Εικόνα";
			case "ha": return "Hoto";
			case "hi": return "तस्वीर";
			case "id": return "Foto";
			case "sw": return "Picha";
			case "mk": return "Фотографија";
			case "ps": return "انځور";
			case "fa-ir": return "عکس";
			case "pl": return "Zdjęcie";
			case "pt-002": return "Foto";
			case "pt-br": return "Foto";
			case "ro": return "Imagine";
			case "ru": return "Фото";
			case "sr": return "Foto";
			case "es": return "Imagen";
			case "tr": return "Fotoğraf";
			case "uk": return "Фото";
			case "ur": return "تصویر";
			default: return "Image";
		}
		default: return word;
	}
};
const m3u8tomp4 = (src) => src.replace("https://hlsvod.dw.com/i/", "https://tvdownloaddw-a.akamaihd.net/").replace(",AVC_480x270,AVC_512x288,AVC_640x360,AVC_960x540,AVC_1280x720,AVC_1920x1080,.mp4.csmil/master.m3u8", "AVC_1920x1080.mp4");
const renderLiveblog = (posts) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: posts?.map((post) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("hr", {}),
	post.localizedContentDate ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("i", { children: post.localizedContentDate }) }) : null,
	post.title ? /* @__PURE__ */ jsx("h2", { children: post.title }) : null,
	post.persons ? post.persons.map((person) => /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("i", { children: person.fullName }) })) : null,
	post.text ? /* @__PURE__ */ jsx(Fragment, { children: raw(post.text) }) : null
] })) }));
const renderVideo = ({ hlsVideoSrc, mp4VideoSrc, posterImageUrl }) => renderToString(/* @__PURE__ */ jsxs("video", {
	controls: true,
	preload: "metadata",
	poster: posterImageUrl ?? void 0,
	children: [/* @__PURE__ */ jsx("source", {
		src: hlsVideoSrc,
		type: "application/x-mpegURL"
	}), /* @__PURE__ */ jsx("source", {
		src: mp4VideoSrc,
		type: "video/mp4"
	})]
}));
const renderDescription = ({ teaser, video, mainImage, text, liveblog, imageI18n }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	teaser ? /* @__PURE__ */ jsx("blockquote", { children: /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("em", { children: teaser }) }) }) : null,
	video ? /* @__PURE__ */ jsx(Fragment, { children: raw(video) }) : mainImage ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
		src: `https://static.dw.com/image/${mainImage.targetId}_${formatId}.jpg`,
		alt: mainImage.additionalInformation
	}), /* @__PURE__ */ jsxs("figcaption", { children: [mainImage.description, /* @__PURE__ */ jsxs("small", { children: [
		imageI18n,
		": ",
		mainImage.target.licenserSupplement
	] })] })] }) : null,
	text ? /* @__PURE__ */ jsx(Fragment, { children: raw(text) }) : null,
	liveblog ? /* @__PURE__ */ jsx(Fragment, { children: raw(liveblog) }) : null
] }));
const processHtml = ($, contentLinks) => {
	$("img").each((_, elem) => {
		try {
			const id = $(elem).attr("data-id");
			const contentLink = contentLinks.find((item) => String(item.targetId) === id);
			$(elem).attr({
				title: contentLink?.name,
				alt: contentLink?.description,
				src: `https://static.dw.com/image/${id}_${formatId}.jpg`
			});
			$(elem).removeAttr("style");
		} catch {}
	});
	$("video").each((_, elem) => {
		try {
			$(elem).attr("poster", $(elem).attr("data-posterurl"));
		} catch {}
	});
	$("iframe").each((_, elem) => {
		try {
			$(elem).attr("src", $(elem).attr("data-src"));
		} catch {}
	});
	$("svg").remove();
};
const processContent = (item, content) => {
	const $text = load(content.text);
	processHtml($text, content.contentLinks);
	const liveblog = item.type === "liveblog" && content.posts ? renderLiveblog(content.posts.map((post) => {
		const $post = load(post.text);
		processHtml($post, content.contentLinks);
		post.text = $post.html();
		return post;
	})) : void 0;
	const video = item.type === "video" && content.hlsVideoSrc ? renderVideo({
		hlsVideoSrc: content.hlsVideoSrc,
		mp4VideoSrc: m3u8tomp4(content.hlsVideoSrc),
		posterImageUrl: content.posterImageUrl
	}) : void 0;
	item.description = renderDescription({
		teaser: content.teaser,
		video,
		mainImage: $text(`[data-id="${content.mainContentImageLink?.targetId}"]`).length === 0 ? content.mainContentImageLink : void 0,
		text: $text.html(),
		liveblog,
		imageI18n: i18n("Image", item.language)
	});
	if (content.trackingCategories) item.category = content.trackingCategories;
	if (content.firstPersonArray) item.author = content.firstPersonArray.map((person) => person.fullName).join(", ");
	return item;
};
const processItems = async (items) => {
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = (await got_default(`https://www.dw.com/graph-api/${item.language}/content/${item.type}/${item.id}`)).data.data.content;
		return processContent(item, content);
	})));
	return items;
};
//#endregion
export { processItems as t };
