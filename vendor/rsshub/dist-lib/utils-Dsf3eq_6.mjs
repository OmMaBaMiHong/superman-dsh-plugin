import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/javtiful/utils.tsx
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: data.previewVideo ? /* @__PURE__ */ jsx("video", {
	controls: true,
	preload: "metadata",
	poster: data.poster,
	children: /* @__PURE__ */ jsx("source", {
		src: data.previewVideo,
		type: "video/mp4"
	})
}) : data.poster ? /* @__PURE__ */ jsx("img", { src: data.poster }) : null }));
const parseItems = (e) => ({
	title: e.find("a > img").attr("alt"),
	link: e.find("a").attr("href"),
	description: renderDescription({
		poster: e.find("a > img").data("src"),
		previewVideo: e.find("a > span").data("trailer")
	}),
	pubDate: parseRelativeDate(e.find(".video-addtime").text())
});
//#endregion
export { parseItems as t };
