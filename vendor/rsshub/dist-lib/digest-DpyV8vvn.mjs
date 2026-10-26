import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/ifanr/digest.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "20");
	const baseUrl = "https://www.ifanr.com";
	const apiBaseUrl = "https://sso.ifanr.com";
	const targetUrl = new URL("digest", baseUrl).href;
	const apiUrl = new URL("api/v5/wp/buzz", apiBaseUrl).href;
	const response = await rofetch(apiUrl, { query: {
		limit,
		offset: 0
	} });
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	const items = response.objects.slice(0, limit).map((item) => {
		const title = item.post_title;
		const description = item.post_content;
		const pubDate = item.created_at;
		const linkUrl = `digest/${item.post_id}`;
		const guid = `ifanr-digest-${item.post_id}`;
		const updated = item.updated_at ?? pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate, "X") : void 0,
			link: new URL(linkUrl, baseUrl).href,
			guid,
			id: guid,
			content: {
				html: description,
				text: item.post_content ?? description
			},
			updated: updated ? parseDate(updated) : void 0,
			language,
			_extra: { links: [{
				url: item.buzz_original_url,
				type: "via",
				content_html: item.post_content
			}] }
		};
	});
	const title = $("title").text();
	return {
		title,
		description: title,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.c-header-navbar__logo").attr("src"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/digest",
	name: "快讯",
	url: "www.ifanr.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/ifanr/digest",
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
		source: ["www.ifanr.comdigest"],
		target: "/digest"
	}],
	view: 0
};
//#endregion
export { handler, route };
