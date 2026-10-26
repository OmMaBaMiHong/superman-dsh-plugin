import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cara/templates/post.tsx
const renderPost = ({ content, images = [] }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [content ? /* @__PURE__ */ jsx("p", { children: content }) : null, images.map((image) => /* @__PURE__ */ jsx("img", { src: image.src }))] }));
//#endregion
export { renderPost as t };
