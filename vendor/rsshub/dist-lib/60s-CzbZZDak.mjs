import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/aa1/60s.ts
const handler = async (ctx) => {
	const { category } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "100");
	const apiSlug = "wp-json/wp/v2";
	const baseUrl = "https://60s.aa1.cn";
	const apiUrl = new URL(`${apiSlug}/posts`, baseUrl).href;
	const apiSearchUrl = new URL(`${apiSlug}/categories`, baseUrl).href;
	const categoryObj = (await rofetch(apiSearchUrl, { query: { search: category } })).find((c) => c.slug === category || c.name === category);
	const categoryId = categoryObj?.id ?? void 0;
	const categorySlug = categoryObj?.slug ?? void 0;
	const response = await rofetch(apiUrl, { query: {
		_embed: "true",
		per_page: limit,
		categories: categoryId
	} });
	const targetUrl = new URL(categorySlug ? `category/${categorySlug}` : "", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	const items = response.slice(0, limit).map((item) => {
		const title = item.title?.rendered ?? item.title;
		const description = item.content.rendered;
		const pubDate = item.date_gmt;
		const linkUrl = item.link;
		const categories = (item._embedded?.["wp:term"])?.flat().map((c) => c.name) ?? [];
		const authors = item._embedded?.author.map((author) => ({
			name: author.name,
			url: author.link,
			avatar: author.avatar_urls?.["96"] ?? author.avatar_urls?.["48"] ?? author.avatar_urls?.["24"] ?? void 0
		})) ?? [];
		const guid = item.guid?.rendered ?? item.guid;
		const image = item._embedded?.["wp:featuredmedia"]?.[0].source_url ?? void 0;
		const updated = item.modified_gmt ?? pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl ?? guid,
			category: categories,
			author: authors,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: updated ? parseDate(updated) : void 0,
			language
		};
	});
	const title = $("title").text();
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("header#header-div img").attr("src"),
		author: title.split(/-/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/60s/:category?",
	name: "每日新闻",
	url: "60s.aa1.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/aa1/60s/news",
	parameters: { category: {
		description: "分类，默认为全部，可在对应分类页 URL 中找到",
		options: [
			{
				label: "全部",
				value: ""
			},
			{
				label: "新闻词文章数据",
				value: "freenewsdata"
			},
			{
				label: "最新",
				value: "new"
			},
			{
				label: "本平台同款自动发文章插件",
				value: "1"
			},
			{
				label: "每天60秒读懂世界",
				value: "news"
			}
		]
	} },
	description: `::: tip
订阅 [每天 60 秒读懂世界](https://60s.aa1.cn/category/news)，其源网址为 \`https://60s.aa1.cn/category/news\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/aa1/60s/news\`](https://rsshub.app/aa1/60s/news) 或 [\`/aa1/60s/每天60秒读懂世界\`](https://rsshub.app/aa1/60s/每天60秒读懂世界)。
:::

| 分类                                                       | ID                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| [全部](https://60s.aa1.cn)                                 | [<空>](https://rsshub.app/aa1/60s)                      |
| [新闻词文章数据](https://60s.aa1.cn/category/freenewsdata) | [freenewsdata](https://rsshub.app/aa1/60s/freenewsdata) |
| [最新](https://60s.aa1.cn/category/new)                    | [new](https://rsshub.app/aa1/60s/new)                   |
| [本平台同款自动发文章插件](https://60s.aa1.cn/category/1)  | [1](https://rsshub.app/aa1/60s/1)                       |
| [每天 60 秒读懂世界](https://60s.aa1.cn/category/news)     | [news](https://rsshub.app/aa1/60s/news)                 |`,
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
			source: ["60s.aa1.cn", "60s.aa1.cn/category/:category"],
			target: "/60s/:category"
		},
		{
			title: "全部",
			source: ["60s.aa1.cn"],
			target: "/60s"
		},
		{
			title: "新闻词文章数据",
			source: ["60s.aa1.cn/category/freenewsdata"],
			target: "/60s/freenewsdata"
		},
		{
			title: "最新",
			source: ["60s.aa1.cn/category/new"],
			target: "/60s/new"
		},
		{
			title: "本平台同款自动发文章插件",
			source: ["60s.aa1.cn/category/1"],
			target: "/60s/1"
		},
		{
			title: "每天60秒读懂世界",
			source: ["60s.aa1.cn/category/news"],
			target: "/60s/news"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
