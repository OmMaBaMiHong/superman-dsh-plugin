import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/nicovideo/utils.tsx
const getUserInfoById = (id) => cache_default.tryGet(`nicovideo:user:${id}`, () => rofetch(`https://embed.nicovideo.jp/users/${id}`));
const getUserVideosById = (id) => cache_default.tryGet(`nicovideo:user:${id}:videos`, async () => {
	const { data } = await rofetch(`https://nvapi.nicovideo.jp/v3/users/${id}/videos`, {
		headers: { "X-Frontend-Id": "6" },
		query: {
			sortKey: "registeredAt",
			sortOrder: "desc",
			sensitiveContents: "mask",
			pageSize: 100,
			page: 1
		}
	});
	return data.items;
}, config.cache.routeExpire, false);
const getMylist = (id) => cache_default.tryGet(`nicovideo:mylist:${id}`, async () => {
	const { data } = await rofetch(`https://nvapi.nicovideo.jp/v2/mylists/${id}`, {
		headers: { "X-Frontend-Id": "6" },
		query: {
			sortKey: "addedAt",
			sortOrder: "desc",
			/**
			* @remarks
			* Up to 500 items can be registered in a single mylist.
			* @see https://qa.nicovideo.jp/faq/show/648?site_domain=default
			*/
			pageSize: 500,
			page: 1
		}
	});
	return data.mylist;
}, config.cache.routeExpire, false);
const renderVideo = (video, embed) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	embed ? /* @__PURE__ */ jsx("iframe", {
		src: `https://embed.nicovideo.jp/watch/${video.id}`,
		style: "top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;",
		allowfullscreen: true
	}) : /* @__PURE__ */ jsx("img", { src: video.thumbnail.nHdUrl || video.thumbnail.largeUrl || video.thumbnail.middleUrl }),
	/* @__PURE__ */ jsx("br", {}),
	video.shortDescription ? /* @__PURE__ */ jsx(Fragment, { children: raw(video.shortDescription) }) : null
] }));
//#endregion
export { renderVideo as i, getUserInfoById as n, getUserVideosById as r, getMylist as t };
