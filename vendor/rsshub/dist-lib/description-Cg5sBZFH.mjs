import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/futunn/templates/description.tsx
const FutunnDescription = ({ pic, abs }) => /* @__PURE__ */ jsxs(Fragment, { children: [pic ? /* @__PURE__ */ jsx("img", { src: pic }) : null, abs ? /* @__PURE__ */ jsx("p", { children: abs }) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(FutunnDescription, { ...data }));
//#endregion
export { renderDescription as t };
