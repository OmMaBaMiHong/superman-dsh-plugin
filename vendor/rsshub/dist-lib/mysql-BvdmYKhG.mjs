import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/taobao/mysql.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "http://mysql.taobao.org";
	const targetUrl = new URL("monthly/", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let count = 0;
	let items = await Promise.all($("h3 a.main").toArray().map(async (monthlyEl) => {
		const $monthlyEl = $(monthlyEl);
		const monthlyUrl = $monthlyEl.attr("href") ? new URL($monthlyEl.attr("href"), baseUrl).href : void 0;
		if (!monthlyUrl) return;
		const $$ = load(await rofetch(monthlyUrl));
		return $$("h3 a.main").toArray().map((el) => {
			if (count < limit) {
				const $$el = $$(el);
				const title = $$el.text();
				const linkUrl = $$el.attr("href");
				const pubDateStr = linkUrl?.split(/monthly\//).pop();
				const upDatedStr = pubDateStr;
				const processedItem = {
					title,
					pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
					link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
					updated: upDatedStr ? parseDate(upDatedStr) : void 0,
					language
				};
				count++;
				return processedItem;
			}
		}).filter(Boolean);
	}));
	items = await Promise.all(items.filter(Boolean).flat().slice(0, limit).map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h2").first().text()?.trim() || item.title;
			const description = $$("div.content").html() ?? void 0;
			const pubDateStr = item.link.split(/monthly\//).pop();
			const authors = $$("div.block p").toArray().map((authorEl) => {
				return {
					name: $$(authorEl).text().split(/:/).pop()?.trim() ?? "",
					url: void 0,
					avatar: void 0
				};
			});
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	const title = $("title").text();
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: title,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/mysql/monthly",
	name: "数据库内核月报",
	url: "mysql.taobao.org",
	maintainers: ["nczitzk"],
	handler,
	example: "/taobao/mysql/monthly",
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
		source: ["mysql.taobao.org/monthly/"],
		target: "/mysql/monthly"
	}],
	view: 0
};
//#endregion
export { handler, route };
