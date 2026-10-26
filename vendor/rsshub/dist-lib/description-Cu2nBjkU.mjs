import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/asiafruitchina/templates/description.tsx
const renderDescription = ({ images, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt ?? void 0
}) }) : null), description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] }));
//#endregion
export { renderDescription as t };
