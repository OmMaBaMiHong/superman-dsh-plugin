import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/openrice/templates/description.tsx
const renderDescription = ({ description, image }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [description, image ? /* @__PURE__ */ jsx("img", { src: image }) : null] }));
//#endregion
export { renderDescription as t };
