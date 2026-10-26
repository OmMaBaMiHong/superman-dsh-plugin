import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/mot/index.ts
const handler = async (ctx) => {
	const { category = "jiaotongyaowen" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://www.mot.gov.cn";
	const targetUrl = new URL(category.endsWith("/") ? category : `${category}/`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("div.tab-pane a").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.attr("title") ?? $el.find("span").first().text();
		const pubDateStr = $el.find("span.badge").text();
		const linkUrl = $el.attr("href");
		const upDatedStr = $el.find(".time").text() || pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? linkUrl.startsWith("http") ? linkUrl : new URL(linkUrl, targetUrl).href : void 0,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link || !/mot\.gov\.cn/.test(item.link) || !item.link.endsWith(".html")) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1").first().text();
			const description = $$("div.TRS_UEDITOR").html() ?? void 0;
			const pubDateStr = $$("meta[name=\"PubDate\"]").attr("content");
			const categories = [...new Set([
				$$("meta[name=\"ColumnName\"]").attr("content"),
				$$("meta[name=\"ColumnType\"]").attr("content"),
				$$("meta[name=\"ContentSource\"]").attr("content"),
				...$$("meta[name=\"Keywords\"]").attr("content")?.split(";") ?? []
			].filter(Boolean))];
			const authors = [$$("meta[name=\"ColumnSource\"]").attr("content"), $$("meta[name=\"Author\"]").attr("content")].filter(Boolean).map((author) => ({
				name: author,
				url: void 0,
				avatar: void 0
			}));
			const image = $$("a.navbar-brand img").attr("src") ? new URL($$("a.navbar-brand img").attr("src"), baseUrl).href : void 0;
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				category: categories,
				author: authors,
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
		description: $("meta[name=\"ColumnDescription\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a.navbar-brand img").attr("src") ? new URL($("a.navbar-brand img").attr("src"), baseUrl).href : void 0,
		author: $("meta[name=\"SiteName\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:category{.+}?",
	name: "通用",
	url: "www.mot.gov.cn",
	maintainers: ["ladeng07", "nczitzk"],
	handler,
	example: "/gov/mot/jiaotongyaowen",
	parameters: { category: {
		description: "分类，默认为 `jiaotongyaowen`，即交通要闻，可在对应分类页 URL 中找到",
		options: [
			{
				label: "交通要闻",
				value: "jiaotongyaowen"
			},
			{
				label: "时政要闻",
				value: "shizhengyaowen"
			},
			{
				label: "重要会议",
				value: "zhongyaohuiyi"
			}
		]
	} },
	description: `::: tip
若订阅 [重要会议](https://www.mot.gov.cn/zhongyaohuiyi/)，网址为 \`https://www.mot.gov.cn/zhongyaohuiyi/\`，请截取 \`https://www.mot.gov.cn/\` 到末尾 \`/\` 的部分 \`zhongyaohuiyi\` 作为 \`category\` 参数填入，此时目标路由为 [\`/gov/mot/zhongyaohuiyi\`](https://rsshub.app/gov/mot/zhongyaohuiyi)。
:::`,
	categories: ["government"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["www.mot.gov.cn/:category"],
			target: (params) => {
				const category = params.category;
				return `/mot${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "交通要闻",
			source: ["www.mot.gov.cn/jiaotongyaowen/"],
			target: "/jiaotongyaowen"
		},
		{
			title: "时政要闻",
			source: ["www.mot.gov.cn/shizhengyaowen/"],
			target: "/shizhengyaowen"
		},
		{
			title: "重要会议",
			source: ["www.mot.gov.cn/zhongyaohuiyi/"],
			target: "/zhongyaohuiyi"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
