import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/aqara/post.tsx
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const rootUrl = "https://aqara.com";
	const apiSlug = "wp-json/wp/v2";
	let filterName;
	let currentUrl = rootUrl;
	let apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}`, rootUrl).href;
	const filterMatches = getSubPath(ctx).match(/^\/([^/]*)\/([^/]*)\/(.*)$/);
	if (filterMatches) {
		const filterRegion = filterMatches[1];
		const filterType = filterMatches[2] === "tag" ? "tags" : filterMatches[2] === "category" ? "categories" : filterMatches[2];
		const filterKeyword = decodeURI(filterMatches[3].split("/").pop());
		const filterApiUrl = new URL(`${filterRegion}/${apiSlug}/${filterType}?search=${filterKeyword}`, rootUrl).href;
		const { data: filterResponse } = await got_default(filterApiUrl);
		const filter = filterResponse.pop();
		if (filter?.id ?? void 0) {
			filterName = filter.name ?? filterKeyword;
			currentUrl = filter.link ?? currentUrl;
			apiUrl = new URL(`${filterRegion}/${apiSlug}/posts?_embed=true&per_page=${limit}&${filterType}=${filter.id}`, rootUrl).href;
		}
	}
	const { data: response } = await got_default(apiUrl);
	const items = response.slice(0, limit).map((item) => {
		const terminologies = item._embedded["wp:term"];
		const content = load(item.content?.rendered ?? item.content);
		content("figure").each((_, el) => {
			const image = content(el).find("img");
			const src = (image.prop("data-actualsrc") ?? image.prop("data-original") ?? image.prop("src")).replace(/(-\d+x\d+)/, "");
			const width = image.prop("data-rawwidth") ?? image.prop("width");
			const height = image.prop("data-rawheight") ?? image.prop("height");
			content(el).replaceWith(renderToString(/* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
				src,
				width,
				height
			}) })));
		});
		return {
			title: item.title?.rendered ?? item.title,
			link: item.link,
			description: content.html(),
			author: item._embedded.author.map((a) => a.name).join("/"),
			category: terminologies.flat().map((c) => c.name),
			guid: item.guid?.rendered ?? item.guid,
			pubDate: parseDate(item.date_gmt),
			updated: parseDate(item.modified_gmt)
		};
	});
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const icon = $("link[rel=\"apple-touch-icon\"]").first().prop("href");
	const title = $("meta[property=\"og:site_name\"]").prop("content") ?? "Aqara";
	return {
		item: items,
		title: `${title}${filterName ? ` - ${filterName}` : ""}`,
		link: currentUrl,
		description: $("meta[property=\"og:title\"]").prop("content"),
		language: $("meta[property=\"og:locale\"]").prop("content"),
		image: $("meta[name=\"msapplication-TileImage\"]").prop("content"),
		icon,
		logo: icon,
		subtitle: $("meta[property=\"og:type\"]").prop("content"),
		author: title
	};
}
//#endregion
export { route };
