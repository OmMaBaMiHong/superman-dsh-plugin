import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/zcool/templates/work.tsx
const normalizeUrl = (url) => url.includes("?x-oss-process") ? url.split("?", 1)[0] : url;
const renderWork = (data) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [data.description ? /* @__PURE__ */ jsx(Fragment, { children: raw(data.description) }) : null, data.productImages?.map((image) => /* @__PURE__ */ jsxs(Fragment, { children: [image.urlBig ? /* @__PURE__ */ jsx("img", { src: normalizeUrl(image.urlBig) }) : null, image.description ? /* @__PURE__ */ jsx(Fragment, { children: raw(image.description) }) : null] }))] }));
//#endregion
//#region lib/routes/zcool/utils.ts
const extractArticle = (data) => data.props.pageProps.data.summary + data.props.pageProps.data.memo;
const extractWork = (data) => renderWork(data.props.pageProps.data);
//#endregion
export { extractWork as n, extractArticle as t };
