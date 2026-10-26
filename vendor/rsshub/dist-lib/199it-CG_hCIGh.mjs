import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/199it/index.tsx
const handler = async (ctx) => {
	const { category = "newly" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://www.199it.com";
	const targetUrl = new URL(category, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("article.newsplus").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("h2.entry-title").text();
		const pubDateStr = $el.find("time.entry-date").attr("datetime");
		const linkUrl = $el.find("h2.entry-title a").attr("href");
		const categoryEls = $el.find("ul.post-categories li:not(submenu-parent)").toArray();
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const image = $el.find("img.attachment-post-thumbnail").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			$$("div.entry-content img.alignnone").each((_, el) => {
				const $el = $$(el);
				const src = $el.attr("src");
				$el.replaceWith(src ? renderToString(/* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
					src,
					width: $el.attr("width"),
					height: $el.attr("height")
				}) })) : "");
			});
			const title = $$("h1.entry-title").text();
			const pubDateStr = $$("time.entry-date").attr("datetime");
			const categoryEls = $$("ul.post-categories li").toArray();
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				category: categories,
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			const extraLinks = $$("ul.related_post li a").toArray().map((extraLinkEl) => {
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
			$$("ul.related_post").parent().remove();
			const description = $$("div.entry-content").html();
			processedItem = {
				...processedItem,
				description,
				content: {
					html: description,
					text: description
				}
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const title = $("title").text();
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("h3.site-title img").attr("src"),
		author: title.split(/-/).pop()?.trim(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:category{.+}?",
	name: "资讯",
	url: "199it.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/199it/newly",
	parameters: { category: {
		description: "分类，默认为 `newly`，即最新，可在对应分类页 URL 中找到",
		options: [
			{
				label: "最新",
				value: "newly"
			},
			{
				label: "报告",
				value: "archives/category/report"
			},
			{
				label: "新兴产业",
				value: "archives/category/emerging"
			},
			{
				label: "金融科技",
				value: "archives/category/fintech"
			},
			{
				label: "共享经济",
				value: "archives/category/sharingeconomy"
			},
			{
				label: "移动互联网",
				value: "archives/category/mobile-internet"
			},
			{
				label: "电子商务",
				value: "archives/category/electronic-commerce"
			},
			{
				label: "社交网络",
				value: "archives/category/social-network"
			},
			{
				label: "网络广告",
				value: "archives/category/advertising"
			},
			{
				label: "投资&amp;经济，互联网金融",
				value: "archives/category/economic-data"
			},
			{
				label: "服务",
				value: "archives/category/service"
			},
			{
				label: "网络服务行业",
				value: "archives/category/dataindustry"
			},
			{
				label: "用户研究",
				value: "archives/category/internet-users"
			}
		]
	} },
	description: `::: tip
若订阅 [研究报告](https://www.199it.com/archives/category/report)，网址为 \`https://www.199it.com/archives/category/report\`，请截取 \`https://www.199it.com/archives/category/report\` 到末尾的部分 \`archives/category/report\` 作为 \`category\` 参数填入，此时目标路由为 [\`/199it/archives/category/report\`](https://rsshub.app/199it/archives/category/report)。
:::

<details>
  <summary>更多分类</summary>

| 分类                                                                            | ID                                                                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [报告](http://www.199it.com/archives/category/report)                           | [archives/category/report](https://rsshub.app/199it/archives/category/report)                           |
| [新兴产业](http://www.199it.com/archives/category/emerging)                     | [archives/category/emerging](https://rsshub.app/199it/archives/category/emerging)                       |
| [金融科技](http://www.199it.com/archives/category/fintech)                      | [archives/category/fintech](https://rsshub.app/199it/archives/category/fintech)                         |
| [共享经济](http://www.199it.com/archives/category/sharingeconomy)               | [archives/category/sharingeconomy](https://rsshub.app/199it/archives/category/sharingeconomy)           |
| [移动互联网](http://www.199it.com/archives/category/mobile-internet)            | [archives/category/mobile-internet](https://rsshub.app/199it/archives/category/mobile-internet)         |
| [电子商务](http://www.199it.com/archives/category/electronic-commerce)          | [archives/category/electronic-commerce](https://rsshub.app/199it/archives/category/electronic-commerce) |
| [社交网络](http://www.199it.com/archives/category/social-network)               | [archives/category/social-network](https://rsshub.app/199it/archives/category/social-network)           |
| [网络广告](http://www.199it.com/archives/category/advertising)                  | [archives/category/advertising](https://rsshub.app/199it/archives/category/advertising)                 |
| [投资 & 经济，互联网金融](http://www.199it.com/archives/category/economic-data) | [archives/category/economic-data](https://rsshub.app/199it/archives/category/economic-data)             |
| [服务](http://www.199it.com/archives/category/service)                          | [archives/category/service](https://rsshub.app/199it/archives/category/service)                         |
| [网络服务行业](http://www.199it.com/archives/category/dataindustry)             | [archives/category/dataindustry](https://rsshub.app/199it/archives/category/dataindustry)               |
| [用户研究](http://www.199it.com/archives/category/internet-users)               | [archives/category/internet-users](https://rsshub.app/199it/archives/category/internet-users)           |

</details>`,
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
			source: ["www.199it.com/:category"],
			target: (params) => {
				const category = params.category;
				return `/199it${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "最新",
			source: ["www.199it.com/newly"],
			target: "/newly"
		},
		{
			title: "报告",
			source: ["www.199it.com/archives/category/report"],
			target: "/archives/category/report"
		},
		{
			title: "新兴产业",
			source: ["www.199it.com/archives/category/emerging"],
			target: "/archives/category/emerging"
		},
		{
			title: "金融科技",
			source: ["www.199it.com/archives/category/fintech"],
			target: "/archives/category/fintech"
		},
		{
			title: "共享经济",
			source: ["www.199it.com/archives/category/sharingeconomy"],
			target: "/archives/category/sharingeconomy"
		},
		{
			title: "移动互联网",
			source: ["www.199it.com/archives/category/mobile-internet"],
			target: "/archives/category/mobile-internet"
		},
		{
			title: "电子商务",
			source: ["www.199it.com/archives/category/electronic-commerce"],
			target: "/archives/category/electronic-commerce"
		},
		{
			title: "社交网络",
			source: ["www.199it.com/archives/category/social-network"],
			target: "/archives/category/social-network"
		},
		{
			title: "网络广告",
			source: ["www.199it.com/archives/category/advertising"],
			target: "/archives/category/advertising"
		},
		{
			title: "投资&amp;经济，互联网金融",
			source: ["www.199it.com/archives/category/economic-data"],
			target: "/archives/category/economic-data"
		},
		{
			title: "服务",
			source: ["www.199it.com/archives/category/service"],
			target: "/archives/category/service"
		},
		{
			title: "网络服务行业",
			source: ["www.199it.com/archives/category/dataindustry"],
			target: "/archives/category/dataindustry"
		},
		{
			title: "用户研究",
			source: ["www.199it.com/archives/category/internet-users"],
			target: "/archives/category/internet-users"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
