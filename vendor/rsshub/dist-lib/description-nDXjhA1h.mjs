import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/logclub/templates/description.tsx
const renderDescription = ({ image, intro, video, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image?.src ? /* @__PURE__ */ jsx("figure", { children: image.alt ? /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) : /* @__PURE__ */ jsx("img", { src: image.src }) }) : null,
	intro ? /* @__PURE__ */ jsx("p", { children: intro }) : null,
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
	description ? raw(description) : null
] }));
//#endregion
export { renderDescription as t };
