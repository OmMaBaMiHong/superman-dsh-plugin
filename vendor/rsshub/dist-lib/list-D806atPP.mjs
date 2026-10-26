import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/fangchan/list.tsx
const handler = async (ctx) => {
	const { id = "datalist" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "http://www.fangchan.com";
	const apiBaseUrl = "http://news.fangchan.com";
	const targetUrl = new URL(id.endsWith("/") ? id : `${id}/`, baseUrl).href;
	const apiUrl = new URL(`api/${id.endsWith("/") ? id.replace(/\/$/, "") : id}.json`, apiBaseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = (await rofetch(apiUrl, { query: {
		pagesize: limit,
		page: 1
	} })).data.slice(0, limit).map((item) => {
		const title = item.title;
		const description = renderToString(item.zhaiyao ? /* @__PURE__ */ jsx("blockquote", { children: item.zhaiyao }) : null);
		const pubDate = item.createtime;
		const linkUrl = item.url;
		const categories = [...new Set([
			item.topcolumn,
			item.subcolumn,
			...item.keyword?.split(/,/) ?? []
		].filter(Boolean))];
		const image = item.pic;
		const updated = item.createtime;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate, "X") : void 0,
			link: linkUrl,
			id: categories,
			content: {
				html: description,
				text: item.zhaiyao ?? description
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
			const title = $$("div.summary-text h").text();
			const description = (item.description ?? "") + ($$("div.top-info").html() ?? "") + ($$("div.summary-text-p").html() ?? "");
			const pubDateStr = $$("span.news-date").text().match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/)?.[1];
			const idEls = $$("a.news-column, div.label span").toArray();
			const categories = [...new Set([...item.id, ...idEls.map((el) => $$(el).text()).filter(Boolean)].filter(Boolean))];
			const authors = $$("span.news-date").text()?.split(/\d{4}-\d{2}-\d{2}/, 1)?.[0]?.trim()?.split(/\s/)?.map((author) => ({ name: author }));
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				id: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			const extraLinks = $$("ul.xgxw-ul li a").toArray().map((extraLinkEl) => {
				const $$extraLinkEl = $$(extraLinkEl);
				return {
					url: $$extraLinkEl.attr("href"),
					type: "related",
					content_html: $$extraLinkEl.text()
				};
			}).filter((_) => true);
			if (extraLinks) processedItem = {
				...processedItem,
				_extra: { links: extraLinks }
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const author = "中房网";
	return {
		title: `${author} - ${$("div.curmbs a").text()}`,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author,
		language
	};
};
const route = {
	path: "/list/:id?",
	name: "列表",
	url: "www.fangchan.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/fangchan/list/datalist",
	parameters: { id: {
		description: "分类，默认为 `datalist`，即数据研究，可在对应分类页 URL 中找到",
		options: [
			{
				label: "数据研究",
				value: "datalist"
			},
			{
				label: "行业测评",
				value: "industrylist"
			},
			{
				label: "政策法规",
				value: "policylist"
			}
		]
	} },
	description: `::: tip
若订阅 [列表](https://www.fangchan.com/)，网址为 \`https://www.fangchan.com/\`，请截取 \`https://www.fangchan.com/\` 到末尾 \`.html\` 的部分 \`datalist\` 作为 \`id\` 参数填入，此时目标路由为 [\`/fangchan/datalist\`](https://rsshub.app/fangchan/datalist)。
:::

| [数据研究](https://www.fangchan.com/datalist)         | [行业测评](https://www.fangchan.com/industrylist)             | [政策法规](https://www.fangchan.com/policylist)           |
| ----------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| [datalist](https://rsshub.app/fangchan/list/datalist) | [industrylist](https://rsshub.app/fangchan/list/industrylist) | [policylist](https://rsshub.app/fangchan/list/policylist) |`,
	categories: ["new-media"],
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
			source: ["www.fangchan.com/:id"],
			target: (params) => {
				const id = params.id;
				return `/fangchan/list/${id ? `/${id}` : ""}`;
			}
		},
		{
			title: "数据研究",
			source: ["www.fangchan.com/datalist"],
			target: "/list/datalist"
		},
		{
			title: "行业测评",
			source: ["www.fangchan.com/industrylist"],
			target: "/list/industrylist"
		},
		{
			title: "政策法规",
			source: ["www.fangchan.com/policylist"],
			target: "/list/policylist"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
