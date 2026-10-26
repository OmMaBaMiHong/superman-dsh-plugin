import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/163/templates/music/playlist.tsx
const renderPlaylistDescription = ({ singer, album, date, picUrl }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	"歌手：",
	singer,
	/* @__PURE__ */ jsx("br", {}),
	"专辑：",
	album,
	/* @__PURE__ */ jsx("br", {}),
	date ? /* @__PURE__ */ jsxs(Fragment, { children: [
		"发行日期：",
		date,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	/* @__PURE__ */ jsx("img", { src: picUrl })
] }));
//#endregion
export { renderPlaylistDescription as t };
