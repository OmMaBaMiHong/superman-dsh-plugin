import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/jpxgmn/utils.tsx
const indexUrl = "http://mei8.vip/";
const getOriginUrl = async () => await cache_default.tryGet("jpxgmn:originUrl", async () => {
	const $ = load((await got_default(indexUrl)).data);
	const entries = $("ul > li > span");
	return "http://" + $(entries[Math.floor(Math.random() * entries.length)]).text();
});
const getImages = ($articleContent) => $articleContent("article > p img").toArray().map((img) => $articleContent(img).attr("src"));
const getArticleDesc = async (articleUrl) => {
	const $content = load((await got_default(articleUrl)).data);
	let pageCnt = $content("div.pagination:first ul a").length - 1;
	if (pageCnt === -1) pageCnt = 1;
	const images = getImages($content);
	const otherImages = await Promise.all(Array.from({ length: pageCnt - 1 }).keys().toArray().map(async (pageIndex) => {
		const pageResponse = await got_default(articleUrl.replace(".html", () => `_${pageIndex + 1}.html`));
		return getImages(load(pageResponse.data));
	}));
	return renderToString(/* @__PURE__ */ jsx(Fragment, { children: [...images, ...otherImages.flat()].map((src) => /* @__PURE__ */ jsx("img", { src })) }));
};
//#endregion
export { getOriginUrl as n, getArticleDesc as t };
