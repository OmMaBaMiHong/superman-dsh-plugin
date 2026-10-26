import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/mihoyo/templates/description.tsx
const renderDescription = (description, images) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [description, images?.length ? images.map((image) => /* @__PURE__ */ jsx("img", { src: image })) : null] }));
//#endregion
export { renderDescription as t };
