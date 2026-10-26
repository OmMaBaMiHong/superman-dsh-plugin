import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/windsurf/blog.tsx
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "10");
	const baseUrl = "https://windsurf.com";
	const targetUrl = new URL("blog", baseUrl).href;
	const apiUrl = new URL("api/blog", baseUrl).href;
	const response = await rofetch(apiUrl, { query: {
		paginate: limit,
		cursor: 0
	} });
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const title = $("title").first().text();
	const author = title.split(/\|/).pop()?.trim();
	const items = response.posts.slice(0, limit).map((item) => {
		const title = item.title;
		const image = item.images?.[0];
		const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image,
			alt: title
		}) }) : null, item.summary ? /* @__PURE__ */ jsx("blockquote", { children: item.summary }) : null] }));
		const pubDate = item.date;
		const linkUrl = item.slug;
		const categories = item.tags;
		const authors = item.authors.map((author) => ({
			name: author,
			url: void 0,
			avatar: void 0
		}));
		const guid = item.slug ? `windsurf-blog-${item.slug}` : void 0;
		const updated = pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl ? new URL(`blog/${linkUrl}`, baseUrl).href : void 0,
			category: categories,
			author: authors,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: updated ? parseDate(updated) : void 0,
			language
		};
	});
	return {
		title,
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author,
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/blog",
	name: "Blog",
	url: "windsurf.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/windsurf/blog",
	parameters: void 0,
	description: void 0,
	categories: ["programming"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["windsurf.com/blog"],
		target: "/blog"
	}],
	view: 0
};
//#endregion
export { handler, route };
