import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/surfshark/templates/description.tsx
const renderDescription = ({ images, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }) : null), description ? raw(description) : null] }));
//#endregion
//#region lib/routes/surfshark/blog.ts
const handler = async (ctx) => {
	const { category } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = `https://surfshark.com`;
	const targetUrl = new URL(`blog${category ? `/${category}` : ""}`, baseUrl).href;
	const headers = {
		host: "surfshark.com",
		origin: baseUrl,
		referer: targetUrl
	};
	const $ = load(await rofetch(targetUrl, { headers }));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.dg-article-single-card").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("div.dg-article-content__info a[title]");
		const title = $aEl.text();
		const image = $el.find("a.dg-article-image img").attr("src");
		const description = renderDescription({ images: image ? [{
			src: image,
			alt: title
		}] : void 0 });
		const pubDateEl = $el.find("span.js-date");
		const pubDateStr = `${pubDateEl.attr("data-year")}-${pubDateEl.attr("data-month")}-${pubDateEl.attr("data-day")}`;
		const linkUrl = $aEl.attr("href");
		const categoryEls = $el.find("div.dg-blog-breadcrumbs a").toArray();
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).slice(1).filter(Boolean))];
		const authors = $el.find("a.author-link ").toArray().map((authorEl) => {
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
			description,
			pubDate: parseDate(pubDateStr),
			link: linkUrl,
			category: categories,
			author: authors,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: parseDate(upDatedStr),
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link, { headers }));
			const title = $$("meta[property=\"og:title\"]").attr("content") ?? item.title;
			const image = $$("div.dg-featured-img-container img").attr("src");
			const description = renderDescription({
				images: image ? [{
					src: image,
					alt: title
				}] : void 0,
				description: $$("div.dg-blog-post-blocks").html()
			});
			const pubDateStr = $$("meta[property=\"article:published_time\"]").attr("content");
			const authors = $$("div.dg-blog-post-author-top").toArray().map((authorEl) => {
				const $$authorEl = $$(authorEl);
				return {
					name: $$authorEl.find("a.author-link").last().text(),
					url: $$authorEl.find("a.author-link").last().attr("href"),
					avatar: $$authorEl.find("a.author-avatar img").attr("src")
				};
			});
			const upDatedStr = $$("meta[property=\"article:modified_time\"]").attr("content");
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
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
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/blog/:category{.+}?",
	name: "Blog",
	url: "surfshark.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/surfshark/blog",
	parameters: { category: {
		description: "Category, All by default",
		options: [
			{
				label: "All",
				value: ""
			},
			{
				label: "Cybersecurity",
				value: "cybersecurity"
			},
			{
				label: "All things VPN",
				value: "all-things-vpn"
			},
			{
				label: "Internet censorship",
				value: "internet-censorship"
			},
			{
				label: "Entertainment",
				value: "entertainment"
			},
			{
				label: "Expert Insights",
				value: "expert-insights"
			},
			{
				label: "Video",
				value: "video"
			},
			{
				label: "News",
				value: "news"
			}
		]
	} },
	description: `::: tip
To subscribe to [Cybersecurity](https://surfshark.com/blog/cybersecurity), where the source URL is \`https://surfshark.com/blog/cybersecurity\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/surfshark/blog/cybersecurity\`](https://rsshub.app/surfshark/blog/cybersecurity).
:::

<details>
  <summary>More categories</summary>

| Category                                                              | ID                                                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [All](https://surfshark.com/blog)                                     | (empty)                                                                      |
| [Cybersecurity](https://surfshark.com/blog/cybersecurity)             | [cybersecurity](https://rsshub.app/surfshark/blog/cybersecurity)             |
| [All things VPN](https://surfshark.com/blog/all-things-vpn)           | [all-things-vpn](https://rsshub.app/surfshark/blog/all-things-vpn)           |
| [Internet censorship](https://surfshark.com/blog/internet-censorship) | [internet-censorship](https://rsshub.app/surfshark/blog/internet-censorship) |
| [Entertainment](https://surfshark.com/blog/entertainment)             | [entertainment](https://rsshub.app/surfshark/blog/entertainment)             |
| [Expert Insights](https://surfshark.com/blog/expert-insights)         | [expert-insights](https://rsshub.app/surfshark/blog/expert-insights)         |
| [Video](https://surfshark.com/blog/video)                             | [video](https://rsshub.app/surfshark/blog/video)                             |
| [News](https://surfshark.com/blog/news)                               | [news](https://rsshub.app/surfshark/blog/news)                               |

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
			source: ["surfshark.com/blog/:category"],
			target: "/blog/:category"
		},
		{
			title: "All",
			source: ["surfshark.com/blog"],
			target: "/blog"
		},
		{
			title: "Cybersecurity",
			source: ["surfshark.com/blog/cybersecurity"],
			target: "/blog/cybersecurity"
		},
		{
			title: "All things VPN",
			source: ["surfshark.com/blog/all-things-vpn"],
			target: "/blog/all-things-vpn"
		},
		{
			title: "Internet censorship",
			source: ["surfshark.com/blog/internet-censorship"],
			target: "/blog/internet-censorship"
		},
		{
			title: "Entertainment",
			source: ["surfshark.com/blog/entertainment"],
			target: "/blog/entertainment"
		},
		{
			title: "Expert Insights",
			source: ["surfshark.com/blog/expert-insights"],
			target: "/blog/expert-insights"
		},
		{
			title: "Video",
			source: ["surfshark.com/blog/video"],
			target: "/blog/video"
		},
		{
			title: "News",
			source: ["surfshark.com/blog/news"],
			target: "/blog/news"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
