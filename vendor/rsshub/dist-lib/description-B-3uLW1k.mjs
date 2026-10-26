import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/kpopping/templates/description.tsx
const renderDescription = ({ images, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: image.alt ? /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) : /* @__PURE__ */ jsx("img", { src: image.src }) }) : null) : null, description ? raw(description) : null] }));
//#endregion
export { renderDescription as t };
