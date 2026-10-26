import { jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/lvv2/templates/outlink.tsx
const renderOutlink = (outlink) => renderToString(/* @__PURE__ */ jsx("a", {
	href: outlink,
	target: "_blank",
	children: "文章链接"
}));
//#endregion
export { renderOutlink as t };
