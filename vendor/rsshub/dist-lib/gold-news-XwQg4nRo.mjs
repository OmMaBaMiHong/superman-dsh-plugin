import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/bullionvault/gold-news.ts
const handler = async (ctx) => {
	const { category } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`gold-news${category ? `/${category}` : ""}`, "https://bullionvault.com").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("section#block-bootstrap-views-block-latest-articles-block div.media, div.gold-news-content table tr").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("td.views-field-title a, div.views-field-title a").first();
		const title = $aEl.text();
		const pubDateStr = $el.find("td.views-field-created, div.views-field-created").text().trim();
		const linkUrl = $aEl.attr("href");
		const authors = $el.find("a.username").toArray().map((authorEl) => {
			const $authorEl = $(authorEl);
			return {
				name: $authorEl.text(),
				url: $authorEl.attr("href"),
				avatar: void 0
			};
		});
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			author: authors,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("article.article h1").text();
			const description = $$("div.content").html() ?? "";
			const pubDateStr = $$("div.submitted").text().split(/,/).pop();
			const categories = $$("meta[name=\"news_keywords\"]").attr("content")?.split(/,/) ?? [];
			const authors = $$("div.view-author-bio").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return {
					name: $$authorEl.find("h1").text(),
					url: void 0,
					avatar: $$authorEl.find("img").attr("src")
				};
			});
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
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
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
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:title\"]").attr("content")?.split(/\|/).pop(),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/gold-news/:category?",
	name: "Gold News",
	url: "bullionvault.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/bullionvault/gold-news",
	parameters: { category: {
		description: "Category",
		options: [
			{
				label: "Gold market analysis & gold investment research",
				value: ""
			},
			{
				label: "Opinion & Analysis",
				value: "opinion-analysis"
			},
			{
				label: "Gold Price News",
				value: "gold-price-news"
			},
			{
				label: "Investment News",
				value: "news"
			},
			{
				label: "Gold Investor Index",
				value: "gold-investor-index"
			},
			{
				label: "Gold Infographics",
				value: "infographics"
			},
			{
				label: "Market Fundamentals",
				value: "market-fundamentals"
			}
		]
	} },
	description: `::: tip
If you subscribe to [Gold Price News](https://www.bullionvault.com/gold-news/gold-price-news)，where the URL is \`https://www.bullionvault.com/gold-news/gold-price-news\`, extract the part \`https://www.bullionvault.com/gold-news/\` to the end, and use it as the parameter to fill in. Therefore, the route will be [\`/bullionvault/gold-news/gold-price-news\`](https://rsshub.app/bullionvault/gold-news/gold-price-news).
:::

| Category                                                                          | ID                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Opinion & Analysis](https://www.bullionvault.com/gold-news/opinion-analysis)     | [opinion-analysis](https://rsshub.app/bullionvault/gold-news/opinion-analysis)       |
| [Gold Price News](https://www.bullionvault.com/gold-news/gold-price-news)         | [gold-price-news](https://rsshub.app/bullionvault/gold-news/gold-price-news)         |
| [Investment News](https://www.bullionvault.com/gold-news/news)                    | [news](https://rsshub.app/bullionvault/gold-news/news)                               |
| [Gold Investor Index](https://www.bullionvault.com/gold-news/gold-investor-index) | [gold-investor-index](https://rsshub.app/bullionvault/gold-news/gold-investor-index) |
| [Gold Infographics](https://www.bullionvault.com/gold-news/infographics)          | [infographics](https://rsshub.app/bullionvault/gold-news/infographics)               |
| [Market Fundamentals](https://www.bullionvault.com/gold-news/market-fundamentals) | [market-fundamentals](https://rsshub.app/bullionvault/gold-news/market-fundamentals) |`,
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
	radar: [
		{
			source: ["bullionvault.com/gold-news/:category"],
			target: (params) => {
				const category = params.category;
				return `/bullionvault/gold-news${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "Gold market analysis & gold investment research",
			source: ["bullionvault.com/gold-news"],
			target: "/gold-news"
		},
		{
			title: "Opinion & Analysis",
			source: ["bullionvault.com/gold-news/opinion-analysis"],
			target: "/gold-news/opinion-analysis"
		},
		{
			title: "Gold Price News",
			source: ["bullionvault.com/gold-news/gold-price-news"],
			target: "/gold-news/gold-price-news"
		},
		{
			title: "Investment News",
			source: ["bullionvault.com/gold-news/news"],
			target: "/gold-news/news"
		},
		{
			title: "Gold Investor Index",
			source: ["bullionvault.com/gold-news/gold-investor-index"],
			target: "/gold-news/gold-investor-index"
		},
		{
			title: "Gold Infographics",
			source: ["bullionvault.com/gold-news/infographics"],
			target: "/gold-news/infographics"
		},
		{
			title: "Market Fundamentals",
			source: ["bullionvault.com/gold-news/market-fundamentals"],
			target: "/gold-news/market-fundamentals"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
