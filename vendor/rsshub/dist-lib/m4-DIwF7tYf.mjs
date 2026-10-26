import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/m4/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt ?? void 0
	}) }) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
//#endregion
//#region lib/routes/m4/index.ts
const route = {
	path: "/:id?/:category{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { id = "news", category = "china" } = ctx.req.param();
	if (!isValidHost(id)) throw new InvalidParameterError("Invalid id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = `http://${id}.m4.cn`;
	const currentUrl = new URL(category ? `/${category.replace(/\/$/, "")}/` : "/", rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("div.articleitem0 div.aheader0").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.text(),
			link: a.prop("href"),
			description: renderDescription({ images: [{
				src: item.parent().find("div.aimg0 a img").prop("src"),
				alt: a.text()
			}] }),
			category: item.find("a.aclass").toArray().map((c) => $(c).text().replaceAll("[]", "").trim()),
			pubDate: timezone(parseDate(item.find("span.atime").text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.title = content("h1").first().text();
		item.description = renderDescription({
			intro: content("div.aintro1, p.cont-summary").text(),
			description: content("div.content0, div.cont-detail").html() ?? void 0
		});
		item.category = content("span.dd0 a, a[rel=\"category\"]").toArray().map((c) => content(c).text()).slice(1);
		item.pubDate = timezone(parseDate(content("span.atime1, span.post-time").text()), 8);
		return item;
	})));
	const image = $("a.logo0_b img").prop("src");
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh",
		image,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author: $("meta[name=\"author\"]").prop("content"),
		allowEmpty: true
	};
}
//#endregion
export { route };
