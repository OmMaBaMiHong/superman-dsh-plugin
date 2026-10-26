import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/jin10/templates/description.tsx
const renderDescription = (content, pic) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [content ? /* @__PURE__ */ jsx(Fragment, { children: raw(content) }) : null, pic ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("img", { src: pic })] }) : null] }));
//#endregion
export { renderDescription as t };
