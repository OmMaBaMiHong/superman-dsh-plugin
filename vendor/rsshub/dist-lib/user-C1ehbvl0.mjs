import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tiktok/templates/user.tsx
const renderUserEmbed = ({ useIframe, id, poster, source }) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: useIframe ? /* @__PURE__ */ jsx("iframe", {
	src: `https://www.tiktok.com/embed/${id}`,
	height: "757",
	frameborder: "0",
	referrerpolicy: "no-referrer"
}) : /* @__PURE__ */ jsx("video", {
	controls: true,
	loop: true,
	poster,
	preload: "metadata",
	children: /* @__PURE__ */ jsx("source", { src: source })
}) }));
//#endregion
export { renderUserEmbed as t };
