import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/coolidge/templates/description.tsx
const CoolidgeDescription = ({ image, intro }) => /* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("img", { src: image }) }) : null, /* @__PURE__ */ jsx("p", { children: intro })] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(CoolidgeDescription, { ...data }));
//#endregion
export { renderDescription as t };
