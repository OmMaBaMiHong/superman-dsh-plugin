import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/zaimanhua/template/comic.tsx
const renderComic = (contents) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: contents.map((img) => /* @__PURE__ */ jsx("img", { src: img })) }));
//#endregion
export { renderComic as t };
