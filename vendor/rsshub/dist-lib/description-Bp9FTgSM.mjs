import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/techcrunch/templates/description.tsx
const renderDescription = ({ head, rendered }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	head.og_image?.length ? head.og_image.map((img) => /* @__PURE__ */ jsx("img", { src: img.url.split("?", 1)[0] })) : null,
	head.og_image?.length ? /* @__PURE__ */ jsx("br", {}) : null,
	raw(rendered)
] }));
//#endregion
export { renderDescription as t };
