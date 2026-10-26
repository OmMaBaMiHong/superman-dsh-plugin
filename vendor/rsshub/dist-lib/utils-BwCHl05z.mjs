import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/lanqiao/utils.tsx
const courseDesc = (picurl, desc) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", { src: picurl }),
	/* @__PURE__ */ jsx("br", {}),
	desc
] }));
var utils_default = { courseDesc };
//#endregion
export { utils_default as t };
