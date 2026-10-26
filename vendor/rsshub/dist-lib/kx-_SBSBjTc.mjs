import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/stcn/kx.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://www.stcn.com";
	const targetUrl = new URL("article/list/kx.html", baseUrl).href;
	const apiUrl = new URL("article/list.html", baseUrl).href;
	const targetResponse = await rofetch(targetUrl);
	const response = await rofetch(apiUrl, {
		headers: { "x-requested-with": "XMLHttpRequest" },
		query: { type: "kx" }
	});
	const $ = load(targetResponse);
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = response.data.slice(0, limit).map((item) => {
		const title = item.title;
		const description = item.content;
		const pubDate = item.time;
		const linkUrl = item.url;
		const categories = item.tags ? item.tags.map((c) => c.name) : [];
		const authors = item.source;
		const image = item.share?.image;
		const updated = pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate, "X") : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			author: authors,
			content: {
				html: description,
				text: item.content ?? description
			},
			image,
			banner: image,
			updated: updated ? parseDate(updated, "X") : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.detail-title").text();
			const description = $$("div.detail-content").html() ?? "";
			const pubDateStr = $$("div.detail-info span").last().text().trim();
			const categories = [.../* @__PURE__ */ new Set([...item.category, ...$$("meta[name=\"keywords\"]").attr("content")?.split(/,/) ?? []])];
			const authors = $$("div.detail-info span").first().text().split(/：/).pop();
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.stcn-logo").attr("src"),
		author: $("meta[name=\"keywords\"]").attr("content")?.split(/,/, 1)[0],
		language,
		id: targetUrl
	};
};
const route = {
	path: "/article/list/kx",
	name: "快讯",
	url: "www.stcn.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/stcn/article/list/kx",
	parameters: void 0,
	description: void 0,
	categories: ["finance"],
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
		source: ["www.stcn.com/article/list/kx.html"],
		target: "/article/list/kx"
	}],
	view: 0
};
//#endregion
export { handler, route };
