import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/oschina/templates/description.tsx
const Description = ({ images, intro, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image, index) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) }, `${image.src}-${index}`) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
export { renderDescription as t };
