import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/trendforce/new.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "10");
	const apiSlug = "wp-json/wp/v2";
	const targetUrl = new URL("news/", "https://www.trendforce.com").href;
	const apiUrl = new URL(`${apiSlug}/posts`, targetUrl).href;
	const response = await rofetch(apiUrl, { query: {
		_embed: "true",
		per_page: limit
	} });
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const items = response.slice(0, limit).map((item) => {
		const title = item.title?.rendered ?? item.title;
		const $$ = load(item.content.rendered);
		$$("div.article_highlight-area-BG_wrap").remove();
		const description = $$.html();
		const pubDate = item.date_gmt;
		const linkUrl = item.link;
		const categories = (item._embedded?.["wp:term"])?.flat().map((c) => c.name) ?? [];
		const authors = item._embedded?.author.map((author) => ({
			name: author.name,
			url: author.url,
			avatar: void 0
		})) ?? [];
		const guid = item.guid?.rendered ?? item.guid;
		const image = item._embedded?.["wp:featuredmedia"]?.[0].source_url ?? void 0;
		const updated = item.modified_gmt ?? pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl ?? guid,
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
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/news",
	name: "News",
	url: "www.trendforce.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/trendforce/news",
	parameters: void 0,
	description: void 0,
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
		source: ["www.trendforce.com/news/"],
		target: "/news"
	}],
	view: 0
};
//#endregion
export { handler, route };
