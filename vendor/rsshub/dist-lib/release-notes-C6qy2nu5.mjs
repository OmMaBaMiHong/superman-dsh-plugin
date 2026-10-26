import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/anytxt/release-notes.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL("download/", "https://anytxt.net").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en-US";
	const image = $("meta[property=\"og:image\"]").attr("content");
	const items = $("p.has-medium-font-size").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.text();
		const description = $el.next().html() ?? "";
		const pubDateStr = title.split(/\s/, 1)[0];
		const linkUrl = targetUrl;
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	}).filter((_) => true);
	return {
		title: $("title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/release-notes",
	name: "Release Notes",
	url: "anytxt.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/anytxt/release-notes",
	parameters: void 0,
	description: void 0,
	categories: ["program-update"],
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
		source: ["anytxt.net"],
		target: "/anytxt/release-notes"
	}],
	view: 0
};
//#endregion
export { handler, route };
