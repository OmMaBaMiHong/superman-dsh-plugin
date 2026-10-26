import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gov/cmse/templates/description.tsx
const renderDescription = ({ image, video, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] }) : null,
	video ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(video), /* @__PURE__ */ jsx("br", {})] }) : null,
	description ? raw(description) : null
] }));
//#endregion
export { renderDescription as t };
