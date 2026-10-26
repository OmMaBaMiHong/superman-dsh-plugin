import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/jinse/templates/description.tsx
const JinseDescription = ({ images, intro, description, original }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => {
		if (!image?.src) return null;
		const altValue = image.height ?? image.width ?? image.alt;
		return /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image.src,
			alt: altValue ? String(altValue) : void 0
		}) });
	}),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null,
	original?.link ? /* @__PURE__ */ jsxs("p", { children: [
		original.name,
		": ",
		/* @__PURE__ */ jsx("a", {
			href: original.link,
			children: original.link
		})
	] }) : null
] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(JinseDescription, { ...data }));
//#endregion
export { renderDescription as t };
