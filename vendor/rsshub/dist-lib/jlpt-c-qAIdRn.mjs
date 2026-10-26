import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/neea/jlpt.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://jlpt.neea.cn";
	const targetUrl = new URL("index.do", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("div.indexcontent a").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.text();
		const pubDateStr = title.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
		const linkUrl = $el.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const processedItem = {
				title: $$("div.dvTitle").text(),
				description: $$("div.dvContent").html() ?? ""
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const title = $("title").text();
	return {
		title: `${title.split(/-/).pop()} - ${$("div.indexcontent h1").text()}`,
		description: title,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("div.header img").attr("arc") ? new URL($("div.header img").attr("arc"), baseUrl).href : void 0,
		author: title.split(/-/, 1)[0],
		language,
		id: targetUrl
	};
};
const route = {
	path: "/jlpt",
	name: "日本语能力测试 JLPT 通知",
	url: "jlpt.neea.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/neea/jlpt",
	parameters: void 0,
	description: void 0,
	categories: ["study"],
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
		source: ["jlpt.neea.cn"],
		target: "/jlpt"
	}],
	view: 0
};
//#endregion
export { handler, route };
