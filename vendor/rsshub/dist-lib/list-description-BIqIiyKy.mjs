import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/douban/templates/list-description.tsx
const ListDescription = ({ ranking_value, title, original_title, rate, card_subtitle, description, cover }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	ranking_value ? /* @__PURE__ */ jsx("p", { children: ranking_value }) : null,
	/* @__PURE__ */ jsx("p", { children: title }),
	original_title ? /* @__PURE__ */ jsx("p", { children: original_title }) : null,
	rate ? /* @__PURE__ */ jsx("p", { children: rate }) : null,
	card_subtitle ? /* @__PURE__ */ jsx("p", { children: card_subtitle }) : null,
	description ? /* @__PURE__ */ jsx("p", { children: description }) : null,
	cover ? /* @__PURE__ */ jsx("img", { src: cover }) : null
] });
const renderListDescription = (props) => renderToString(/* @__PURE__ */ jsx(ListDescription, { ...props }));
//#endregion
export { renderListDescription as t };
