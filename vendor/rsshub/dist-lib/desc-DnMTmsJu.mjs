import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cnki/templates/desc.tsx
const renderDescription = ({ author, company, content }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("text", { children: `作者：${author} ` }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("text", { children: `单位：${company} ` }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("text", { children: content })
] }));
//#endregion
export { renderDescription as t };
