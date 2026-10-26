import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/163/utils.tsx
const renderDescription = (imgsrc, postBody) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [imgsrc ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: imgsrc }), /* @__PURE__ */ jsx("br", {})] }) : null, postBody ? /* @__PURE__ */ jsx(Fragment, { children: raw(postBody) }) : null] }));
const parseDyArticle = (item) => cache_default.tryGet(item.link, async () => {
	const $ = load((await got_default(item.link, { responseType: "buffer" })).data);
	$(".post_main img").each((_, i) => {
		if (!i.attribs.src) return;
		const url = new URL(i.attribs.src);
		if (url.host === "nimg.ws.126.net") i.attribs.src = url.searchParams.get("url");
	});
	const imgsrc = item.imgsrc ? new URL(item.imgsrc).searchParams.get("url") : false;
	item.description = renderDescription(imgsrc, $(".post_body").html());
	item.feedLink = $(".post_wemedia_name a").attr("href");
	item.feedDescription = $(".post_wemedia_title").text();
	item.feedImage = $(".post_wemedia_avatar img").attr("src");
	return item;
});
//#endregion
export { parseDyArticle as t };
