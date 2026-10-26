import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/ali213/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) }, image.src) : null) : null,
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
//#endregion
export { renderDescription as t };
