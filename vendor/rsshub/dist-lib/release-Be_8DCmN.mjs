import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/python/release.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL("downloads", "https://www.python.org").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.active-release-list-widget ol.list-row-container li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("span.release-version").text();
		const pubDateStr = $el.find("span.release-start").text()?.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
		const linkUrl = $el.find("span.release-pep a").attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1.page-title").text();
			const description = $$("section#pep-content").html();
			const image = $$("meta[property=\"og:image\"]").attr("content");
			const processedItem = {
				title,
				description,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	return {
		title: $("div.active-release-list-widget h2.widget-title").text(),
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/release",
	name: "Active Python Releases",
	url: "www.python.org",
	maintainers: ["nczitzk"],
	handler,
	example: "/python/release",
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
		source: ["www.python.org", "www.python.org/downloads"],
		target: "/release"
	}],
	view: 0
};
//#endregion
export { handler, route };
