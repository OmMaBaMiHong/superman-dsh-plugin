import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/kiro/changelog.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://kiro.dev";
	const targetUrl = new URL("changelog/", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("a.block").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = `${$el.parent().find("span").text()} ${$el.find("h3").text()}`;
		const description = $el.parent().parent().find("div.prose").html() ?? void 0;
		const pubDateStr = $el.parent().parent().parent().find("time").text();
		const linkUrl = $el.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			content: {
				html: description,
				text: description
			},
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = `${$$("article span").first().text()} ${$$("article h3").text()}`;
			const description = $$("div.prose").html() ?? void 0;
			const pubDateStr = $$("time").text();
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
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
	path: "/changelog",
	name: "Changelog",
	url: "kiro.dev",
	maintainers: ["nczitzk"],
	handler,
	example: "/kiro/changelog",
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
		source: ["kiro.dev", "kiro.dev/changelog/"],
		target: "/changelog"
	}],
	view: 0
};
//#endregion
export { handler, route };
