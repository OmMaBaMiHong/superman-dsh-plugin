import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/tidb/blog.ts
const escapeHtml = (text) => text?.replaceAll("&", "&amp;")?.replaceAll("<", "&lt;")?.replaceAll(">", "&gt;")?.replaceAll("'", "&quot;")?.replaceAll("'", "&#039;") ?? text;
const parseTextChildren = (children) => children.map((child) => escapeHtml(child.text)).join("");
const parseImageNode = (node) => {
	const titleAttr = node.title ? ` title="${escapeHtml(node.title)}"` : "";
	const altAttr = node.alt ? ` alt="${escapeHtml(node.alt)}"` : "";
	const styleAttr = node.size ? ` style="width:${node.size.width}px;height:${node.size.height}px;"` : "";
	return `<img src="${escapeHtml(node.url)}"${titleAttr}${altAttr}${styleAttr}>`;
};
const parseListItemNode = (listItem) => `<li>${parseContentToHtml(listItem.children)}</li>`;
const parseListNode = (node) => {
	const tag = node.ordered ? "ol" : "ul";
	return `<${tag}${node.ordered && node.start !== 1 ? ` start="${node.start}"` : ""}>${node.children.map((item) => parseListItemNode(item)).join("")}</${tag}>`;
};
const parseParagraphChildren = (children) => children.map((child) => {
	if (child.text !== void 0) return escapeHtml(child.text);
	if (child.type === "image") return parseImageNode(child);
	return "";
}).join("");
const parseContentToHtml = (content) => content?.map((node) => {
	switch (node.type) {
		case "paragraph": return `<p>${parseParagraphChildren(node.children)}</p>`;
		case "image": return parseImageNode(node);
		case "heading": return `<h${node.depth}>${parseTextChildren(node.children)}</h${node.depth ?? ""}>`;
		case "code": return `<pre><code${node.lang ? ` class="language-${node.lang}"` : ""}>${parseTextChildren(node.children)}</code></pre>`;
		case "list": return parseListNode(node);
		case "blockquote": return `<blockquote>${parseContentToHtml(node.children)}</blockquote>`;
		default: return "";
	}
}).join("") ?? "";
const handler = async (ctx) => {
	const { category = "latest" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "20");
	const baseUrl = "https://tidb.net";
	const targetUrl = new URL(`blog${category === "latest" ? "" : `/c/${category}`}`, baseUrl).href;
	const targetResponse = await rofetch(targetUrl);
	const buildId = targetResponse.match(/"buildId":"(.*?)"/)?.[1];
	if (!buildId) throw new Error("Build ID not found.");
	const $ = load(targetResponse);
	const language = $("html").attr("lang") ?? "zh";
	const apiUrl = new URL(`_next/data/${buildId}/${language}/blog${category === "latest" ? "" : `/c/${category}`}.json`, baseUrl).href;
	let items = (await rofetch(apiUrl, { query: { latest: true } })).pageProps.blogs.content.slice(0, limit).map((item) => {
		const title = item.title;
		const description = item.summary;
		const pubDate = item.publishedAt;
		const linkUrl = item.slug ? `blog/${item.slug}` : void 0;
		const categories = [...new Set([item.category?.name, ...(item.tags ?? []).map((c) => c.name)].filter(Boolean))];
		const authors = item.author?.username ? [{
			name: item.author.username,
			url: new URL(`u/${item.author.username}`, baseUrl).href,
			avatar: item.author.avatarURL
		}] : void 0;
		const guid = item.slug ?? "";
		const updated = item.lastModifiedAt ?? pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			author: authors,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			updated: updated ? parseDate(updated) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailUrl = new URL(`blog/api/posts/${item.guid}/detail`, baseUrl).href;
			const detailResponse = await rofetch(detailUrl, { query: { visit: true } });
			const title = detailResponse.title;
			const description = detailResponse.content ? parseContentToHtml(JSON.parse(detailResponse.content)) : item.description;
			const pubDate = detailResponse.publishedAt;
			const linkUrl = `blog/${detailResponse.slug}`;
			const categories = [...new Set([detailResponse.category?.name, ...(detailResponse.tags ?? []).map((c) => c.name)].filter(Boolean))];
			const authors = detailResponse.author?.username ? [{
				name: detailResponse.author.username,
				url: new URL(`u/${detailResponse.author.username}`, baseUrl).href,
				avatar: detailResponse.author.avatarURL
			}] : void 0;
			const guid = `tidb-blog-${detailResponse.slug}`;
			const updated = detailResponse.lastModifiedAt ?? pubDate;
			const processedItem = {
				title,
				description,
				pubDate: pubDate ? parseDate(pubDate) : void 0,
				link: new URL(linkUrl, baseUrl).href,
				category: categories,
				author: authors,
				guid,
				id: guid,
				content: {
					html: description,
					text: description
				},
				updated: updated ? parseDate(updated) : void 0,
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
		description: $("meta[property=\"og:description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: title.split(/\|/).pop()?.trim(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/blog/c/:category?",
	name: "专栏分类",
	url: "tidb.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/tidb/blog/c/latest",
	parameters: { category: {
		description: "分类，默认为 `latest`，即全部文章，可在对应分类页 URL 中找到",
		options: [
			{
				label: "全部文章",
				value: "latest"
			},
			{
				label: "管理与运维",
				value: "management-and-operation"
			},
			{
				label: "实践案例",
				value: "practical-case"
			},
			{
				label: "架构选型",
				value: "architecture-selection"
			},
			{
				label: "原理解读",
				value: "principle-interpretation"
			},
			{
				label: "应用开发",
				value: "application-development"
			},
			{
				label: "社区动态",
				value: "community-feeds"
			}
		]
	} },
	description: `::: tip
订阅 [管理与运维](https://tidb.net/blog/c/management-and-operation)，其源网址为 \`https://tidb.net/blog/c/management-and-operation\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/tidb/blog/c/management-and-operation\`](https://rsshub.app/tidb/blog/c/management-and-operation)。
:::

| 分类                                                           | ID                                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [全部文章](https://tidb.net/blog)                              | [latest](https://rsshub.app/tidb/blog)                                              |
| [管理与运维](https://tidb.net/blog/c/management-and-operation) | [management-and-operation](https://rsshub.app/tidb/blog/c/management-and-operation) |
| [实践案例](https://tidb.net/blog/c/practical-case)             | [practical-case](https://rsshub.app/tidb/blog/c/practical-case)                     |
| [架构选型](https://tidb.net/blog/c/architecture-selection)     | [architecture-selection](https://rsshub.app/tidb/blog/c/architecture-selection)     |
| [原理解读](https://tidb.net/blog/c/principle-interpretation)   | [principle-interpretation](https://rsshub.app/tidb/blog/c/principle-interpretation) |
| [应用开发](https://tidb.net/blog/c/application-development)    | [application-development](https://rsshub.app/tidb/blog/c/application-development)   |
| [社区动态](https://tidb.net/blog/c/community-feeds)            | [community-feeds](https://rsshub.app/tidb/blog/c/community-feeds)                   |`,
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
	radar: [
		{
			source: ["tidb.net/blog", "tidb.net/blog/c/:category"],
			target: (params) => {
				const category = params.category;
				return `/tidb/blog/c${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "全部文章",
			source: ["tidb.net/blog"],
			target: "/blog/c/latest"
		},
		{
			title: "管理与运维",
			source: ["tidb.net/blog/c/management-and-operation"],
			target: "/blog/c/management-and-operation"
		},
		{
			title: "实践案例",
			source: ["tidb.net/blog/c/practical-case"],
			target: "/blog/c/practical-case"
		},
		{
			title: "架构选型",
			source: ["tidb.net/blog/c/architecture-selection"],
			target: "/blog/c/architecture-selection"
		},
		{
			title: "原理解读",
			source: ["tidb.net/blog/c/principle-interpretation"],
			target: "/blog/c/principle-interpretation"
		},
		{
			title: "应用开发",
			source: ["tidb.net/blog/c/application-development"],
			target: "/blog/c/application-development"
		},
		{
			title: "社区动态",
			source: ["tidb.net/blog/c/community-feeds"],
			target: "/blog/c/community-feeds"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
