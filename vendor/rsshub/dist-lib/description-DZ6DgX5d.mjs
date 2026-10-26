import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/radio/templates/description.tsx
const RadioDescription = ({ description, enclosure_url, enclosure_type }) => /* @__PURE__ */ jsxs(Fragment, { children: [description ? /* @__PURE__ */ jsx("p", { children: description }) : null, enclosure_url && enclosure_type ? /* @__PURE__ */ jsx("audio", {
	controls: "controls",
	preload: "metadata",
	children: /* @__PURE__ */ jsx("source", {
		src: enclosure_url,
		type: enclosure_type
	})
}) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(RadioDescription, { ...data }));
//#endregion
export { renderDescription as t };
