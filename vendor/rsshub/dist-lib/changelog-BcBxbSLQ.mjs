import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/windsurf/changelog.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "100");
	const targetUrl = new URL("changelog", "https://windsurf.com").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const title = $("title").first().text();
	const author = title.split(/\|/).pop()?.trim();
	const items = $("div[aria-label=\"changelog-layout\"]").slice(0, limit).toArray().map((el) => {
		const $el = $(el).parent();
		const version = $el.find("header div").first().text()?.trim();
		const title = [version, $el.find("article h1").text()?.trim()].filter(Boolean).join(" ");
		const description = $el.find("article div").first()?.html() ?? void 0;
		const pubDateStr = $el.find("header div").last().text()?.trim();
		const guid = version ? `windsurf-${version}` : "";
		const image = $el.find("article img").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: targetUrl,
			author,
			doi: $el.find("meta[name=\"citation_doi\"]").attr("content"),
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
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
	path: "/changelog",
	name: "Changelog",
	url: "windsurf.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/windsurf/changelog",
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
		source: ["windsurf.com/changelog"],
		target: "/changelog"
	}],
	view: 0
};
//#endregion
export { handler, route };
