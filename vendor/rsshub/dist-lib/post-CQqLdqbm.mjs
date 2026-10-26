import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/vcb-s/templates/post.tsx
const VcbPostDescription = ({ medias, post }) => /* @__PURE__ */ jsxs(Fragment, { children: [medias?.map((media) => /* @__PURE__ */ jsx("figure", {
	class: "thumbnail",
	children: /* @__PURE__ */ jsx("img", {
		width: media.media_details?.width,
		height: media.media_details?.height,
		src: media.source_url
	})
})), post ? raw(post) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(VcbPostDescription, { ...data }));
//#endregion
export { renderDescription as t };
