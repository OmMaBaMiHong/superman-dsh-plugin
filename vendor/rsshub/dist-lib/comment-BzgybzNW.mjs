import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/qoo-app/templates/comment.tsx
const renderComment = ({ rating, text }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	rating,
	"/5.0",
	/* @__PURE__ */ jsx("br", {}),
	text ? raw(text) : null
] }));
//#endregion
export { renderComment as t };
