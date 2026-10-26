import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/vimeo/templates/description.tsx
const Description = ({ videoUrl, vdescription }) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("iframe", {
	width: "640",
	height: "360",
	src: `https://player.vimeo.com/video${videoUrl}`,
	frameborder: "0",
	webkitAllowFullScreen: true,
	mozallowfullscreen: true,
	allowFullScreen: true
}), vdescription ? /* @__PURE__ */ jsx("p", { children: raw(vdescription) }) : null] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
export { renderDescription as t };
