import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ieee/templates/description.tsx
const renderDescription = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("big", { children: item.title }) }), /* @__PURE__ */ jsx("br", {})] }),
	/* @__PURE__ */ jsxs("p", { children: [
		/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsx("i", { children: item.authors }) }) }),
		/* @__PURE__ */ jsx("br", {}),
		/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsxs("a", {
			href: `https://doi.org/${item.doi}`,
			children: ["https://doi.org/", item.doi]
		}) }) }) }),
		/* @__PURE__ */ jsx("br", {}),
		/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsxs("i", { children: ["Volume ", item.volume ?? ""] }) }) }),
		/* @__PURE__ */ jsx("br", {})
	] }),
	/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("span", { children: item.abstract }), /* @__PURE__ */ jsx("br", {})] })
] }));
//#endregion
export { renderDescription as t };
