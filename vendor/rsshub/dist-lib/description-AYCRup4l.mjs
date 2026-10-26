import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/papers/templates/description.tsx
const PapersDescription = ({ pdfUrl, kimiUrl, authors, summary }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	pdfUrl ? /* @__PURE__ */ jsx("a", {
		href: pdfUrl,
		children: "[PDF]"
	}) : null,
	kimiUrl ? /* @__PURE__ */ jsx("a", {
		href: kimiUrl,
		children: "[Kimi]"
	}) : null,
	authors?.length ? /* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "Authors:" }), authors.map((author) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
		href: author.url,
		children: author.name
	}), ","] }))] }) : null,
	summary ? /* @__PURE__ */ jsx("p", { children: summary }) : null
] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(PapersDescription, { ...data }));
//#endregion
export { renderDescription as t };
