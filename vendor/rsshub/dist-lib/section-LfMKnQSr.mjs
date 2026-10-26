import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/indianexpress/section.ts
const handler = async (ctx) => {
	const { id = "trending" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "50");
	const apiSlug = "wp-json/wp/v2";
	const baseUrl = "https://indianexpress.com";
	const apiUrl = new URL(`${apiSlug}/article`, baseUrl).href;
	const apiSearchUrl = new URL(`${apiSlug}/ie_section`, baseUrl).href;
	const sectionObj = (await rofetch(apiSearchUrl, { query: { search: id } })).find((c) => c.slug === id || c.name === id || id.includes(c.slug));
	const sectionId = sectionObj?.id ?? void 0;
	const sectionLink = sectionObj?.link ?? void 0;
	const response = await rofetch(apiUrl, { query: {
		_embed: "true",
		per_page: limit,
		ie_section: sectionId
	} });
	const targetUrl = sectionLink ?? new URL(`section/${id.endsWith("/") ? id : `${id}/`}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const items = response.slice(0, limit).map((item) => {
		const title = item.title?.rendered ?? item.title;
		const description = item.content.rendered;
		const pubDate = item.date_gmt;
		const linkUrl = item.link;
		const categories = (item._embedded?.["wp:term"])?.flat().map((c) => c.name) ?? [];
		const guid = item.guid?.rendered ?? item.guid;
		const updated = item.modified_gmt ?? pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl ?? guid,
			category: categories,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			updated: updated ? parseDate(updated) : void 0,
			language
		};
	});
	const author = $("meta[property=\"og:site_name\"]").attr("content") || $("meta[property=\"og:title\"]").attr("content");
	return {
		title: `${author ? `${author} - ` : ""}${sectionObj?.name ?? id}`,
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author,
		language,
		feedLink: $("link[type=\"application/rss+xml\"]").attr("href"),
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/section/:id{.+}?",
	name: "Section",
	url: "indianexpress.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/indianexpress/section/explained",
	parameters: { id: { description: "Section ID, `trending` as Trending by default" } },
	description: `::: tip
To subscribe to [Section](https://indianexpress.com/), where the source URL is \`https://indianexpress.com/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/indianexpress/section/explained\`](https://rsshub.app/indianexpress/section/explained).
:::`,
	categories: ["new-media"],
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
		source: ["indianexpress.com/section/:id"],
		target: "/section/:id"
	}],
	view: 0
};
//#endregion
export { handler, route };
