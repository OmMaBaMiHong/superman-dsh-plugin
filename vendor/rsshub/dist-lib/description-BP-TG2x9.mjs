import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/itch/templates/description.tsx
const renderDescription = ({ images, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => /* @__PURE__ */ jsx("img", { src: image })), description ? raw(description) : null] }));
//#endregion
export { renderDescription as t };
