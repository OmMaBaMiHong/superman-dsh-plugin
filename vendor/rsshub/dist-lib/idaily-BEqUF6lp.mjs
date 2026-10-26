import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/idaily/index.tsx
const route = {
	path: "/:language?",
	name: "每日环球视野",
	example: "/idaily",
	maintainers: ["zphw", "nczitzk"],
	parameters: { language: "语言，见下表，默认为简体中文" },
	radar: [{ source: ["idai.ly/"] }],
	handler,
	description: `| 简体中文 | 繁体中文 |
| -------- | -------- |
| zh-hans  | zh-hant  |`
};
async function handler(ctx) {
	const { language = "zh-hans" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100;
	const apiUrl = new URL(`api/list/v3/iphone/${language}`, "https://idaily-cdn.idailycdn.com").href;
	const currentUrl = "https://idai.ly";
	const { data: response } = await got_default(apiUrl);
	const items = response.filter((item) => item.ui_sets?.caption_subtitle).slice(0, limit).map((item) => {
		const image = item.ui_sets?.cover_landscape_hd_4k ?? item.cover_landscape_hd;
		return {
			title: `${item.ui_sets?.caption_subtitle} - ${item.title}`,
			link: item.link_share,
			description: renderDescription(image ? [{
				src: image,
				alt: item.ui_sets?.caption_subtitle ?? item.title
			}] : void 0, item.content),
			author: item.location,
			category: item.tags?.map((c) => c.name),
			guid: `idaily-${item.guid}`,
			pubDate: parseDate(item.pubdate_timestamp, "X"),
			updated: parseDate(item.lastupdate_timestamp, "X"),
			enclosure_url: image,
			enclosure_type: `image/${image.split(/\./).pop()}`
		};
	});
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const title = $("title").text();
	const image = new URL("img/idaily/logo_2x.png", currentUrl).href;
	return {
		item: items,
		title,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh",
		image,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author: title.split(/\s/, 1)[0],
		allowEmpty: true
	};
}
const renderDescription = (images, intro) => renderToString(/* @__PURE__ */ jsx(IdailyDescription, {
	images,
	intro
}));
const IdailyDescription = ({ images, intro }) => /* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }) : null), intro ? /* @__PURE__ */ jsx("p", { children: intro }) : null] });
//#endregion
export { route };
