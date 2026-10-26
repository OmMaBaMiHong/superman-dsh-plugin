import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/followin/utils.tsx
const apiUrl = "https://api.followin.io";
const baseUrl = "https://followin.io";
const favicon = `${baseUrl}/favicon.ico`;
const renderThread = (list) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: list.map((item) => /* @__PURE__ */ jsxs(Fragment, { children: [
	raw((item.translated_content || item.content).replaceAll("\n", "<br>")),
	/* @__PURE__ */ jsx("br", {}),
	item.images.length ? item.images.map((image) => /* @__PURE__ */ jsx("img", { src: image })) : null,
	item.link_previews.length ? item.link_previews.map((linkPreview) => /* @__PURE__ */ jsxs("a", {
		href: linkPreview.link,
		children: [
			linkPreview.title,
			/* @__PURE__ */ jsx("br", {}),
			linkPreview.content
		]
	})) : null,
	/* @__PURE__ */ jsx("br", {})
] })) }));
const getBParam = (lang) => ({
	a: "web",
	b: "",
	c: lang,
	d: 0,
	e: "",
	f: "",
	g: "",
	h: "0.1.0",
	i: "official"
});
const getBuildId = () => cache_default.tryGet("followin:buildId", async () => {
	const { data: pageResponse } = await got_default(baseUrl);
	const $ = load(pageResponse);
	const { buildId } = JSON.parse($("script#__NEXT_DATA__").text());
	return buildId;
}, config.cache.routeExpire, false);
const getGToken = () => cache_default.tryGet("followin:gtoken", async () => {
	const { data } = await got_default.post(`${apiUrl}/user/gtoken`);
	return data.data.gtoken;
});
const parseList = (list, lang, buildId) => list.map((item) => ({
	title: item.translated_title || item.title,
	description: item.translated_content || item.content,
	link: `${baseUrl}/${lang === "en" ? "" : `${lang}/`}feed/${item.id}`,
	pubDate: parseDate(item.publish_time, "x"),
	category: item.tags.map((tag) => tag.name),
	author: item.nickname,
	nextData: `${baseUrl}/_next/data/${buildId}/${lang}/feed/${item.id}.json`
}));
const parseItem = (item) => cache_default.tryGet(item.link, async () => {
	const { data } = await got_default(item.nextData);
	const { queries } = data.pageProps.dehydratedState;
	const info = queries.find((q) => q.queryKey[0] === "/feed/info").state;
	const thread = queries.find((q) => q.queryKey[0] === "/feed/thread");
	item.description = thread ? renderThread(thread.state.data.list) : info.data.translated_full_content || info.data.full_content;
	item.updated = parseDate(info.dataUpdatedAt, "x");
	item.category = [.../* @__PURE__ */ new Set([...item.category, ...info.data.tags.map((tag) => tag.name)])];
	return item;
});
//#endregion
export { getBuildId as a, parseList as c, getBParam as i, baseUrl as n, getGToken as o, favicon as r, parseItem as s, apiUrl as t };
