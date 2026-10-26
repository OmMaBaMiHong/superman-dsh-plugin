import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/ianspriggs/templates/description.tsx
const renderDescription = ({ images, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }, image.src) : null) : null, description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] }));
//#endregion
//#region lib/routes/ianspriggs/index.ts
const route = {
	path: "/:category?",
	categories: ["blog"],
	example: "/ianspriggs/portraits",
	parameters: { category: "Category, see below, 3D PORTRAITS by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Category",
	maintainers: ["nczitzk"],
	handler,
	description: `| 3D PORTRAITS | CHARACTERS |
| ------------ | ---------- |
| portraits    | characters |`
};
async function handler(ctx) {
	const { category = "portraits" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const author = "Ian Spriggs";
	const rootUrl = "https://ianspriggs.com";
	const currentUrl = new URL(category, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("div.work-item").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const image = item.find("img").first();
		return {
			title: item.find("div.work-info").text(),
			link: item.find("a").prop("href"),
			description: renderDescription({ images: image?.prop("src") ? [{
				src: image.prop("src").replace(/_thumbnail\./, "."),
				alt: image.prop("alt")
			}] : void 0 }),
			author,
			pubDate: parseDate(item.find("div.work-info p").last(), "YYYY"),
			enclosure_url: image?.prop("src") ?? void 0,
			enclosure_type: image?.prop("src") ? "image/jpeg" : void 0
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		const images = content("div.work-item img").toArray().map((item) => {
			item = content(item);
			return {
				src: item.prop("src").replace(/-\d+x\d+\./, "."),
				alt: item.prop("alt")
			};
		});
		item.title = content("div.project-title").text();
		item.description += renderDescription({
			images,
			description: content("div.nectar-fancy-ul").html()
		});
		item.pubDate = parseDate(content("span.subheader").last().text(), "YYYY");
		return item;
	})));
	const icon = new URL("favicon.ico", rootUrl).href;
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[property=\"og:description\"]").prop("content"),
		language: $("html").prop("lang"),
		icon,
		logo: icon,
		subtitle: $("a[aria-current=\"page\"] span.menu-title-text").text(),
		author
	};
}
//#endregion
export { route };
