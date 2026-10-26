import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/kantarworldpanel/index.tsx
const route = {
	path: "/:region?/:category{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { region = "cn-en", category = "news" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "https://www.kantarworldpanel.com/";
	const currentUrl = new URL(`${region}/${category}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("ul.slide, #newssource").find("li").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const image = item.find("img");
		const title = item.find("h3.mediumFont").text().trim();
		let link = a.prop("href");
		link = link === "#" ? currentUrl : link;
		const description = item.find("p.gowhite").text();
		const imageSrc = image.prop("src");
		return {
			title,
			link,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [description ? raw(description) : null, imageSrc ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", { src: imageSrc }) }) : null] })),
			guid: link.startsWith(rootUrl) ? `${link}#${title}` : link,
			pubDate: parseDate(item.find("p.medGrey").text(), "DD/MM/YYYY")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link === currentUrl || !item.link.startsWith(rootUrl)) return item;
		if (/dwl\.php/.test(item.link)) {
			item.enclosure_url = item.link;
			item.enclosure_type = "application/pdf";
			return item;
		}
		const detailResponse = await got_default(item.link);
		if (!detailResponse.url.startsWith(rootUrl)) return item;
		const content = load(detailResponse.data);
		item.title = content("h1.newshead").text();
		item.description = content("div.center-content div.left-layout-col").html();
		item.category = content("meta[name=\"keywords\"]").prop("content")?.split(/,\s?/) ?? [];
		item.pubDate = parseDate(content("p.newsdateshare").text(), "DD/MM/YYYY");
		return item;
	})));
	const icon = new URL("favicon.ico", rootUrl).href;
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image: $("#logoprint img").prop("src"),
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		allowEmpty: true
	};
}
//#endregion
export { route };
