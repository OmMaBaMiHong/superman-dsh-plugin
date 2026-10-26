import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/javtrailers/templates/description.tsx
const renderDescription = (videoInfo) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	videoInfo.image ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: videoInfo.image }), /* @__PURE__ */ jsx("br", {})] }) : null,
	videoInfo.dvdId ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: "DVD ID:" }),
		" ",
		videoInfo.dvdId,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videoInfo.contentId ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: "Content ID:" }),
		" ",
		videoInfo.contentId,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videoInfo.releaseDate ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: "Release Date:" }),
		" ",
		videoInfo.releaseDate,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videoInfo.duration ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: "Duration:" }),
		" ",
		videoInfo.duration,
		" mins",
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videoInfo.director ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: "Director:" }),
		" ",
		videoInfo.director,
		" ",
		videoInfo.jpDirector,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videoInfo.studio ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: "Studio:" }),
		" ",
		videoInfo.studio.name,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videoInfo.categories?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: "Categories:" }),
		videoInfo.categories.map((category) => /* @__PURE__ */ jsxs(Fragment, { children: [
			" ",
			category.name,
			","
		] })),
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videoInfo.casts?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("b", { children: "Cast(s):" }),
		videoInfo.casts.map((cast) => /* @__PURE__ */ jsxs(Fragment, { children: [
			" ",
			cast.name,
			" ",
			cast.jpName
		] })),
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	videoInfo.gallery?.length ? videoInfo.gallery.map((image) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] })) : null
] }));
//#endregion
//#region lib/routes/javtrailers/utils.ts
const baseUrl = "https://javtrailers.com";
const headers = { Authorization: "AELAbPQCh_fifd93wMvf_kxMD_fqkUAVf@BVgb2!md@TNW8bUEopFExyGCoKRcZX" };
const hdGallery = (gallery) => gallery.map((item) => {
	if (item.startsWith("https://pics.dmm.co.jp/")) return item.replace(/-(\d+)\.jpg$/, "jp-$1.jpg");
	if (item.startsWith("https://image.mgstage.com/")) return item.replace(/cap_t1_/, "cap_e_");
	return item;
});
const parseList = (videos) => videos.map((item) => ({
	title: `${item.dvdId} ${item.title}`,
	link: `${baseUrl}/video/${item.contentId}`,
	pubDate: parseDate(item.releaseDate),
	contentId: item.contentId
}));
const playwrightFetch = async (url, context) => {
	const page = await context.newPage();
	await page.setExtraHTTPHeaders(headers);
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	logger.http(`Requesting ${url}`);
	await page.goto(url, { waitUntil: "domcontentloaded" });
	const apiResponse = await page.evaluate(() => document.body.textContent || "");
	const response = JSON.parse(apiResponse);
	await page.close();
	return response;
};
const getItem = async (item, context) => {
	const videoInfo = (await playwrightFetch(`${baseUrl}/api/video/${item.contentId}`, context)).video;
	videoInfo.gallery = hdGallery(videoInfo.gallery);
	item.description = renderDescription(videoInfo);
	item.author = videoInfo.casts.map((cast) => `${cast.name} ${cast.jpName}`).join(", ");
	item.category = videoInfo.categories.map((category) => `${category.name}／${category.jpName}／${category.zhName}`);
	return item;
};
//#endregion
export { playwrightFetch as i, getItem as n, parseList as r, baseUrl as t };
