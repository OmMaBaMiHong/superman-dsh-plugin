import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/modelscope/templates/desc.tsx
const renderDescription = ({ coverImage, description, md }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	coverImage ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: coverImage }), /* @__PURE__ */ jsx("br", {})] }) : null,
	description ? /* @__PURE__ */ jsxs(Fragment, { children: [description, /* @__PURE__ */ jsx("br", {})] }) : null,
	md ? /* @__PURE__ */ jsx(Fragment, { children: raw(md) }) : null
] }));
//#endregion
export { renderDescription as t };
