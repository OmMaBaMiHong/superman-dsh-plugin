import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/acfun/templates/description.tsx
const Description = ({ embed, aid, img }) => /* @__PURE__ */ jsxs(Fragment, { children: [embed ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("iframe", {
	width: "640",
	height: "360",
	src: `https://www.acfun.cn/player/${aid}`,
	frameborder: "0",
	allowfullscreen: true
}), /* @__PURE__ */ jsx("br", {})] }) : null, img ? /* @__PURE__ */ jsx("img", { src: img }) : null] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
export { renderDescription as t };
