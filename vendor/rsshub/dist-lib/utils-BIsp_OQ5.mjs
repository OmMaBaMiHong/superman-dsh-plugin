import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/pikabu/templates/video.tsx
const renderVideo = ({ videoId, preview, width, mp4, webm }) => renderToString(videoId ? /* @__PURE__ */ jsx("iframe", {
	id: "ytplayer",
	type: "text/html",
	width: "640",
	height: "360",
	src: `https://www.youtube-nocookie.com/embed/${videoId}`,
	frameborder: "0",
	allowfullscreen: true,
	referrerpolicy: "strict-origin-when-cross-origin"
}) : webm || mp4 ? /* @__PURE__ */ jsxs("video", {
	controls: true,
	preload: "metadata",
	poster: preview,
	width,
	children: [webm ? /* @__PURE__ */ jsx("source", {
		src: webm,
		type: "video/webm"
	}) : null, mp4 ? /* @__PURE__ */ jsx("source", {
		src: mp4,
		type: "video/mp4"
	}) : null]
}) : null);
//#endregion
//#region lib/routes/pikabu/utils.ts
const baseUrl = "https://pikabu.ru";
const fixImage = (element) => {
	element.find(".story-image__stretch").remove();
	element.find(".story-image__image").each((_, img) => {
		if (!(img.attribs["data-src"] && img.attribs["data-large-image"])) return;
		img.attribs.src = img.attribs["data-large-image"];
		delete img.attribs["data-src"];
		delete img.attribs["data-large-image"];
	});
};
const fixVideo = (element) => {
	const preview = element.find(".player__preview").attr("style").match(/url\((.+)\);/)[1];
	const dataType = element.attr("data-type");
	let videoHtml;
	if (dataType === "video") {
		const videoId = element.attr("data-source").match(/\/embed\/(.+)$/)[1];
		videoHtml = renderVideo({ videoId });
	} else if (dataType === "video-file") videoHtml = renderVideo({
		preview,
		width: element.find(".player__svg-stretch").attr("width"),
		mp4: `${element.attr("data-source")}.mp4`,
		webm: element.attr("data-webm")
	});
	else throw new Error(`Unknown video type: ${dataType}`);
	element.replaceWith(videoHtml);
};
//#endregion
export { fixImage as n, fixVideo as r, baseUrl as t };
