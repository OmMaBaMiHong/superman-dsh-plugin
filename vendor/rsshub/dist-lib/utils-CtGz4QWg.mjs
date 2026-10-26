import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/taptap/utils.tsx
const X_UA = (lang = "zh_CN") => `X-UA=${encodeURIComponent(`V=1&PN=WebApp&VN=0.1.0&LANG=${lang}&PLT=PC`)}`;
const getRootUrl = (isIntl = false) => isIntl ? "https://www.taptap.io" : "https://www.taptap.cn";
const appDetail = (appId, lang = "zh_CN", isIntl = false) => cache_default.tryGet(`taptap:appDetail:${appId}:${lang}:${isIntl}`, async () => {
	return (await rofetch(`${getRootUrl(isIntl)}/webapiv2/group/v1/detail?app_id=${appId}&${X_UA(lang)}`, { headers: { Referer: `${getRootUrl(isIntl)}/app/${appId}` } })).data;
});
const imagePost = (images) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: images.map((image) => /* @__PURE__ */ jsx("img", { src: image.original_url || image.url })) }));
const topicPost = async (appId, topicId, lang = "zh_CN") => {
	const $ = load((await rofetch(`${getRootUrl(false)}/webapiv2/topic/v1/detail?id=${topicId}&${X_UA(lang)}`, { headers: { Referer: `${getRootUrl(false)}/app/${appId}` } })).data.first_post.contents.text, null, false);
	$("img").each((_, e) => {
		const $e = $(e);
		$e.attr("src", $e.attr("data-origin-url"));
		$e.removeAttr("data-origin-url");
	});
	return $.html();
};
const videoPost = (video) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: "Preview" }), /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("img", { src: video.thumbnail.original_url || video.thumbnail.url }) })] }));
//#endregion
export { topicPost as a, imagePost as i, appDetail as n, videoPost as o, getRootUrl as r, X_UA as t };
