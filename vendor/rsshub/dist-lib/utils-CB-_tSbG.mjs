import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/bsky/templates/post.tsx
const renderPost = ({ text, embed }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [text ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(text), /* @__PURE__ */ jsx("br", {})] }) : null, embed ? /* @__PURE__ */ jsx(Fragment, { children: embed.$type === "app.bsky.embed.images#view" ? embed.images?.map((image) => /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("img", {
	src: image.fullsize,
	alt: image.alt ?? ""
}), /* @__PURE__ */ jsx("br", {})] })) : embed.$type === "app.bsky.embed.video#view" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("video", {
	controls: true,
	poster: embed.thumbnail,
	style: "max-width: 100%; height: auto;",
	preload: "metadata",
	children: [/* @__PURE__ */ jsx("source", {
		src: embed.playlist,
		type: "application/x-mpegURL"
	}), "Your browser does not support HTML5 video playback."]
}), /* @__PURE__ */ jsx("br", {})] }) : embed.$type === "app.bsky.embed.external#view" ? /* @__PURE__ */ jsxs("a", {
	href: embed.external?.uri,
	children: [
		/* @__PURE__ */ jsx("b", { children: embed.external?.title }),
		/* @__PURE__ */ jsx("br", {}),
		embed.external?.description
	]
}) : null }) : null] }));
//#endregion
//#region lib/routes/bsky/utils.ts
/**
* docs: https://atproto.com/lexicons/app-bsky
*/
const resolveHandle = (handle) => cache_default.tryGet(`bsky:${handle}`, async () => {
	const { data } = await got_default("https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle", { searchParams: { handle } });
	return data.did;
});
const getProfile = (did) => cache_default.tryGet(`bsky:profile:${did}`, async () => {
	const { data } = await got_default("https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile", { searchParams: { actor: did } });
	return data;
});
const getAuthorFeed = (did, filter) => cache_default.tryGet(`bsky:authorFeed:${did}:${filter}`, async () => {
	const { data } = await got_default("https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed", { searchParams: {
		actor: did,
		filter,
		limit: 30
	} });
	return data;
}, config.cache.routeExpire, false);
const getFeed = (uri) => cache_default.tryGet(`bsky:feed:${uri}`, async () => {
	const { data } = await got_default("https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed", { searchParams: {
		feed: uri,
		limit: 30
	} });
	return data;
}, config.cache.routeExpire, false);
const getFeedGenerator = (uri) => cache_default.tryGet(`bsky:feedGenerator:${uri}`, async () => {
	const { data } = await got_default("https://public.api.bsky.app/xrpc/app.bsky.feed.getFeedGenerator", { searchParams: { feed: uri } });
	return data;
}, config.cache.routeExpire, false);
//#endregion
export { resolveHandle as a, getProfile as i, getFeed as n, renderPost as o, getFeedGenerator as r, getAuthorFeed as t };
