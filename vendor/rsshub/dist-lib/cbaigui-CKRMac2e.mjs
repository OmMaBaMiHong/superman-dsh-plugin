import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cbaigui/templates/figure.tsx
const Figure = ({ src, width, height }) => /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src,
	width,
	height
}) });
const renderFigure = (props) => renderToString(/* @__PURE__ */ jsx(Figure, { ...props }));
//#endregion
//#region lib/routes/cbaigui/utils.ts
const rootUrl = "https://cbaigui.com";
const apiSlug = "wp-json/wp/v2";
const GetFilterId = async (type, name) => {
	const filterApiUrl = new URL(`${apiSlug}/${type}?search=${name}`, rootUrl).href;
	const { data: filterResponse } = await got_default(filterApiUrl);
	return filterResponse.findLast((f) => f.name === name)?.id ?? void 0;
};
//#endregion
//#region lib/routes/cbaigui/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	let filterName;
	const currentUrl = new URL(getSubPath(ctx).replace(/^\/cbaigui/, ""), rootUrl).href;
	let apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}`, rootUrl).href;
	const filterMatches = getSubPath(ctx).match(/^\/post-(tag|category)\/(.*)$/);
	if (filterMatches) {
		filterName = decodeURI(filterMatches[2].split("/").pop());
		const filterType = filterMatches[1] === "tag" ? "tags" : "categories";
		const filterId = await GetFilterId(filterType, filterName);
		if (filterId) apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}&${filterType}=${filterId}`, rootUrl).href;
	}
	const { data: response } = await got_default(apiUrl);
	const items = response.slice(0, limit).map((item) => {
		const terminologies = item._embedded["wp:term"];
		const content = load(item.content?.rendered ?? item.content);
		content("figure").each((_, el) => {
			const image = content(el).find("img");
			const src = image.prop("data-actualsrc") ?? image.prop("data-original");
			const width = image.prop("data-rawwidth");
			const height = image.prop("data-rawheight");
			content(el).replaceWith(renderFigure({
				src,
				width,
				height
			}));
		});
		content("p img").each((_, el) => {
			const image = content(el);
			const src = image.prop("src").split("!", 1)[0];
			const width = image.prop("width");
			const height = image.prop("height");
			content(el).replaceWith(renderFigure({
				src,
				width,
				height
			}));
		});
		return {
			title: item.title?.rendered ?? item.title,
			link: item.link,
			description: content.html(),
			author: item._embedded.author.map((a) => a.name).join("/"),
			category: [...terminologies[0], ...terminologies[1]].map((c) => c.name),
			guid: item.guid?.rendered ?? item.guid,
			pubDate: parseDate(item.date_gmt),
			updated: parseDate(item.modified_gmt)
		};
	});
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const icon = $("link[rel=\"apple-touch-icon\"]").first().prop("href");
	return {
		item: items,
		title: `纪妖${filterName ? ` - ${filterName}` : ""}`,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh-cn",
		image: $("meta[name=\"msapplication-TileImage\"]").prop("content"),
		icon,
		logo: icon,
		subtitle: $("p.site-description").text(),
		author: $("p.site-title").text()
	};
}
//#endregion
export { route };
