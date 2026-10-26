import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/moa/gjs.ts
const handler = async (ctx) => {
	const { category = "gzdt" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "http://www.gjs.moa.gov.cn";
	const targetUrl = new URL(category.endsWith("/") ? category : `${category}/`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("ul#div li").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const aEl = $el.find("a");
		const title = aEl.attr("title") ?? $el.find("span.sj_gztzle").text();
		const pubDateStr = $el.find("span.sj_gztzri").text();
		const linkUrl = aEl.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: parseDate(pubDateStr),
			link: linkUrl ? new URL(linkUrl, targetUrl).href : void 0,
			updated: parseDate(upDatedStr),
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("meta[name=\"ArticleTitle\"]").attr("content") ?? "";
			const description = $$("div.TRS_Editor").html() ?? "";
			const pubDateStr = $$("meta[name=\"PubDate\"]").attr("content");
			const linkUrl = $$("meta[name=\"Url\"]").attr("content");
			const categoryEls = $$("meta[name=\"ColumnName\"], meta[name=\"ContentSource\"], meta[name=\"Keywords\"]").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).attr("content")).filter(Boolean))];
			const authors = $$("meta[name=\"Author\"]").attr("content");
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				link: linkUrl ?? item.link,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			const $enclosureEl = $$("div.sj_fujianxia_right ul li a").first();
			const enclosureUrl = $enclosureEl.attr("href");
			if (enclosureUrl) {
				const enclosureType = `application/${enclosureUrl.split(".").pop()}`;
				const enclosureTitle = $enclosureEl.text();
				processedItem = {
					...processedItem,
					enclosure_url: new URL(enclosureUrl, item.link).href,
					enclosure_type: enclosureType,
					enclosure_title: enclosureTitle || title
				};
			}
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const author = "中华人民共和国农业农村部国际合作司";
	const description = $("meta[name=\"ColumnName\"]").attr("content") ?? "";
	return {
		title: `${author} - ${description}`,
		description,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: new URL("images/logo-china.png", baseUrl).href,
		author,
		language
	};
};
const route = {
	path: "/gjs/:category{.+}?",
	name: "国际合作司",
	url: "www.gjs.moa.gov.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/gov/moa/gjs/gzdt",
	parameters: { category: {
		description: "分类，默认为 `gzdt`，即工作动态，可在对应分类页 URL 中找到",
		options: [
			{
				label: "工作动态",
				value: "gzdt"
			},
			{
				label: "通知公告",
				value: "tzgg"
			},
			{
				label: "“一带一路”合作和农业走出去",
				value: "ydylhzhhnyzcq"
			},
			{
				label: "农业国际贸易监测与展望",
				value: "ncpmy"
			},
			{
				label: "多双边合作",
				value: "dsbhz"
			}
		]
	} },
	description: `::: tip
若订阅 [中华人民共和国农业农村部国际合作司工作动态](https://www.gjs.moa.gov.cn/gzdt/)，网址为 \`https://www.gjs.moa.gov.cn/gzdt/\`，请截取 \`https://www.gjs.moa.gov.cn/\` 到末尾 \`/\` 的部分 \`gzdt\` 作为 \`category\` 参数填入，此时目标路由为 [\`/gov/moa/gjs/gzdt\`](https://rsshub.app/gov/moa/gjs/gzdt)。
:::

| [工作动态](http://www.gjs.moa.gov.cn/gzdt/) | [通知公告](http://www.gjs.moa.gov.cn/tzgg/) | [“一带一路” 合作和农业走出去](http://www.gjs.moa.gov.cn/ydylhzhhnyzcq/) | [农业国际贸易监测与展望](http://www.gjs.moa.gov.cn/ncpmy/) | [多双边合作](http://www.gjs.moa.gov.cn/dsbhz/) |
| ------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| [gzdt](https://rsshub.app/gov/moa/gjs/gzdt) | [tzgg](https://rsshub.app/gov/moa/gjs/tzgg) | [ydylhzhhnyzcq](https://rsshub.app/gov/moa/gjs/ydylhzhhnyzcq)           | [ncpmy](https://rsshub.app/gov/moa/gjs/ncpmy)              | [dsbhz](https://rsshub.app/gov/moa/gjs/dsbhz)  |`,
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
			source: ["www.gjs.moa.gov.cn/:category{.+}?"],
			target: (params) => {
				const category = params.category;
				return `/gov/moa/gjs${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "工作动态",
			source: ["www.gjs.moa.gov.cn/gzdt/"],
			target: "/gjs/gzdt"
		},
		{
			title: "通知公告",
			source: ["www.gjs.moa.gov.cn/tzgg/"],
			target: "/gjs/tzgg"
		},
		{
			title: "“一带一路”合作和农业走出去",
			source: ["www.gjs.moa.gov.cn/ydylhzhhnyzcq/"],
			target: "/gjs/ydylhzhhnyzcq"
		},
		{
			title: "农业国际贸易监测与展望",
			source: ["www.gjs.moa.gov.cn/ncpmy/"],
			target: "/gjs/ncpmy"
		},
		{
			title: "多双边合作",
			source: ["www.gjs.moa.gov.cn/dsbhz/"],
			target: "/gjs/dsbhz"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
