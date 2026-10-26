import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/cls/templates/depth.tsx
const renderDepthDescription = (articleDetail) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [articleDetail.images?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [articleDetail.images.map((image) => /* @__PURE__ */ jsx("img", { src: image }, image)), /* @__PURE__ */ jsx("br", {})] }) : null, articleDetail.content ? /* @__PURE__ */ jsx(Fragment, { children: raw(articleDetail.content) }) : null] }));
//#endregion
export { renderDepthDescription as t };
