import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/pts/templates/description.tsx
const renderDescription = ({ image, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("img", { src: image }) : null, description ? raw(description) : null] }));
//#endregion
export { renderDescription as t };
