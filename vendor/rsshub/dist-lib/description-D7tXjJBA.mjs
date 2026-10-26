import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/douyu/templates/description.tsx
const renderDescription = ({ content, images, replies }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	content ? /* @__PURE__ */ jsx(Fragment, { children: content }) : null,
	images?.map((image) => /* @__PURE__ */ jsx("img", {
		src: image.url,
		width: image.size?.w,
		height: image.size?.h
	})),
	replies?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h3", { children: "回复" }), replies.map((reply) => /* @__PURE__ */ jsxs("p", { children: [
		/* @__PURE__ */ jsx("b", { children: reply.nickname }),
		" ",
		/* @__PURE__ */ jsxs("small", { children: [
			"[",
			reply.time,
			"]"
		] }),
		": ",
		reply.content
	] }))] }) : null
] }));
//#endregion
export { renderDescription as t };
