import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
//#region lib/routes/gov/nea/bureau.ts
const route = {
	path: "/sjzz/:bureau",
	categories: ["government"],
	example: "/gov/nea/sjzz/ghs",
	parameters: { bureau: {
		description: "司局",
		options: [
			{
				value: "zhs",
				label: "综合司"
			},
			{
				value: "fgs",
				label: "法改司"
			},
			{
				value: "ghs",
				label: "规划司"
			},
			{
				value: "kjs",
				label: "科技司"
			},
			{
				value: "dls",
				label: "电力司"
			},
			{
				value: "hds",
				label: "核电司"
			},
			{
				value: "mts",
				label: "煤炭司"
			},
			{
				value: "yqs",
				label: "油气司"
			},
			{
				value: "xny",
				label: "新能源司"
			},
			{
				value: "jgs",
				label: "监管司"
			},
			{
				value: "aqs",
				label: "安全司"
			},
			{
				value: "gjs",
				label: "国际司"
			},
			{
				value: "jgdw",
				label: "机关党委（人事司）"
			}
		]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["nea.gov.cn/sjzz/:bureau/index.htm"],
		target: "/sjzz/:bureau"
	}],
	name: "司工作进展",
	maintainers: ["nczitzk", "pseudoyu"],
	handler,
	url: "www.nea.gov.cn/"
};
async function handler(ctx) {
	const { bureau } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 35;
	const rootUrl = "https://www.nea.gov.cn";
	const link = `${rootUrl}/sjzz/${bureau}/index.htm`;
	const $ = load(await rofetch(link));
	const dataSourceId = $("ul#showData0").attr("data")?.split(/:/).pop();
	if (!dataSourceId) throw new Error("Data source ID not found");
	const jsonUrl = new URL(`ds_${dataSourceId}.json`, link).href;
	const list = (await rofetch(jsonUrl)).datasource.slice(0, limit).map((item) => {
		const title = sanitizeHtml(item.title, {
			allowedTags: [],
			allowedAttributes: {}
		});
		return {
			title,
			link: new URL(item.publishUrl, rootUrl).href,
			pubDate: item.publishTime ? timezone(parseDate(item.publishTime), 8) : void 0,
			description: item.summary?.trim() || title,
			author: [...new Set([
				item.sourceText,
				item.author,
				item.editor,
				item.responsibleEditor
			].filter(Boolean))].map((author) => ({ name: author })),
			category: item.keywords.split(/,/)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $ = load(await rofetch(item.link));
			item.title = $("meta[name=\"ArticleTitle\"]").prop("content") || item.title;
			item.description = $("#detailContent").html() || $("div.article-content").html() || item.description;
			item.category = [.../* @__PURE__ */ new Set([...item.category ?? [], ...$("meta[name=\"keywords\"]").attr("content")?.split(/,/) ?? []])];
			const detailPubDate = $("meta[name=\"PubDate\"]").prop("content");
			item.pubDate = detailPubDate ? timezone(parseDate(detailPubDate), 8) : item.pubDate;
		} catch {}
		return item;
	})));
	return {
		title: `${$("head title").text()}${$("#tab03").text()}`,
		description: $("head meta[name=\"ColumnDescription\"]").attr("content"),
		item: items,
		link
	};
}
//#endregion
export { route };
