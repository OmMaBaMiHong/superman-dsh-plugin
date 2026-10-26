import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/caixin/templates/article.tsx
const renderArticle = ({ item, $ }) => {
	const subhead = $(".article .subhead").length ? $(".article .subhead").html() : null;
	const media = $(".article .media").length ? $(".article .media").html() : null;
	const contentVideo = $(".article .content_video").length ? $("script").text().match(/initPlayer\('(.*?)','(.*?)'\)/) : null;
	const mainContent = $("div#Main_Content_Val.text").length ? $("div#Main_Content_Val.text").html() : null;
	const picsValue = item.pics;
	const picsList = typeof picsValue === "string" && picsValue.includes("#") ? picsValue.split("#") : null;
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		item.audio ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("audio", {
			src: item.audio,
			controls: true
		}), /* @__PURE__ */ jsx("br", {})] }) : null,
		subhead ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("blockquote", { children: /* @__PURE__ */ jsx("p", { children: raw(subhead) }) }), /* @__PURE__ */ jsx("br", {})] }) : null,
		media ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(media), /* @__PURE__ */ jsx("br", {})] }) : null,
		contentVideo ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("video", {
			controls: true,
			preload: "metadata",
			poster: contentVideo[2],
			src: contentVideo[1]
		}), /* @__PURE__ */ jsx("br", {})] }) : null,
		mainContent ? /* @__PURE__ */ jsx(Fragment, { children: raw(mainContent) }) : /* @__PURE__ */ jsxs(Fragment, { children: [item.summary ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("blockquote", { children: /* @__PURE__ */ jsx("p", { children: item.summary }) }), /* @__PURE__ */ jsx("br", {})] }) : null, picsList ? /* @__PURE__ */ jsx(Fragment, { children: picsList.map((pic) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: pic }), /* @__PURE__ */ jsx("br", {})] })) }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: picsValue }), /* @__PURE__ */ jsx("br", {})] })] })
	] }));
};
//#endregion
export { renderArticle as t };
