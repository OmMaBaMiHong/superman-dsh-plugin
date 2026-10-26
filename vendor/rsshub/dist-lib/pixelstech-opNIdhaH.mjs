import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/pixelstech/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt ?? void 0
	}) }) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
//#endregion
//#region lib/routes/pixelstech/index.ts
const handler = async (ctx) => {
	const { topic } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "10");
	const baseUrl = "https://www.pixelstech.net";
	const targetUrl = new URL(`feed/${topic ?? ""}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	let items = $("div.feed-item").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a.feed-item-link");
		const title = $aEl.text();
		const image = $el.attr("data-bg-image");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $el.find("div.feed-item-description").text()
		});
		const pubDateStr = $el.parent().find("h2.section-heading").text();
		const linkUrl = $aEl.attr("href");
		const guid = $el.attr("data-feed-id") ? `pixelstech-feed#${$el.attr("data-feed-id")}` : "";
		const upDatedStr = $el.find(".time").text() || pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			try {
				const $$ = load(await rofetch(item.link));
				$$("div.login-prompt").remove();
				const title = $$("h1").text();
				const description = (item.description ?? "") + renderDescription({ description: $$("article.content-article").html() ?? void 0 });
				const processedItem = {
					title,
					description,
					link: $$("span.source-text a").attr("href") ?? item.link,
					content: {
						html: description,
						text: description
					},
					language
				};
				return {
					...item,
					...processedItem
				};
			} catch {
				return item;
			}
		});
	}));
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[name=\"twitter:image\"]").attr("content"),
		author: $("meta[name=\"author\"]").attr("content"),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/feed/:topic?",
	name: "Feed",
	url: "www.pixelstech.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/pixelstech/feed/ai",
	parameters: { category: {
		description: "Topic, all by default",
		options: [
			{
				label: "All",
				value: ""
			},
			{
				label: "AI",
				value: "ai"
			},
			{
				label: "Alibaba",
				value: "alibaba"
			},
			{
				label: "Apple",
				value: "apple"
			},
			{
				label: "Database",
				value: "database"
			},
			{
				label: "Go",
				value: "go"
			},
			{
				label: "Huawei",
				value: "huawei"
			},
			{
				label: "Java",
				value: "java"
			},
			{
				label: "JavaScript",
				value: "javascript"
			},
			{
				label: "Linux",
				value: "linux"
			},
			{
				label: "LLM",
				value: "llm"
			},
			{
				label: "Nvidia",
				value: "nvidia"
			},
			{
				label: "Python",
				value: "python"
			},
			{
				label: "Rust",
				value: "rust"
			},
			{
				label: "Tesla",
				value: "tesla"
			},
			{
				label: "Web",
				value: "web"
			},
			{
				label: "Web3",
				value: "web3"
			},
			{
				label: "Zig",
				value: "zig"
			}
		]
	} },
	description: `::: tip
To subscribe to [AI](https://www.pixelstech.net/feed/ai), where the source URL is \`https://www.pixelstech.net/feed/ai\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/pixelstech/feed/ai\`](https://rsshub.app/pixelstech/feed/ai).
:::

<details>
  <summary>More topics</summary>

| Topic                                                    | ID                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| [AI](https://www.pixelstech.net/feed/ai)                 | [ai](https://rsshub.app/pixelstech/feed/ai)                 |
| [Alibaba](https://www.pixelstech.net/feed/alibaba)       | [alibaba](https://rsshub.app/pixelstech/feed/alibaba)       |
| [Apple](https://www.pixelstech.net/feed/apple)           | [apple](https://rsshub.app/pixelstech/feed/apple)           |
| [Database](https://www.pixelstech.net/feed/database)     | [database](https://rsshub.app/pixelstech/feed/database)     |
| [Go](https://www.pixelstech.net/feed/go)                 | [go](https://rsshub.app/pixelstech/feed/go)                 |
| [Huawei](https://www.pixelstech.net/feed/huawei)         | [huawei](https://rsshub.app/pixelstech/feed/huawei)         |
| [Java](https://www.pixelstech.net/feed/java)             | [java](https://rsshub.app/pixelstech/feed/java)             |
| [JavaScript](https://www.pixelstech.net/feed/javascript) | [javascript](https://rsshub.app/pixelstech/feed/javascript) |
| [Linux](https://www.pixelstech.net/feed/linux)           | [linux](https://rsshub.app/pixelstech/feed/linux)           |
| [LLM](https://www.pixelstech.net/feed/llm)               | [llm](https://rsshub.app/pixelstech/feed/llm)               |
| [Nvidia](https://www.pixelstech.net/feed/nvidia)         | [nvidia](https://rsshub.app/pixelstech/feed/nvidia)         |
| [Python](https://www.pixelstech.net/feed/python)         | [python](https://rsshub.app/pixelstech/feed/python)         |
| [Rust](https://www.pixelstech.net/feed/rust)             | [rust](https://rsshub.app/pixelstech/feed/rust)             |
| [Tesla](https://www.pixelstech.net/feed/tesla)           | [tesla](https://rsshub.app/pixelstech/feed/tesla)           |
| [Web](https://www.pixelstech.net/feed/web)               | [web](https://rsshub.app/pixelstech/feed/web)               |
| [Web3](https://www.pixelstech.net/feed/web3)             | [web3](https://rsshub.app/pixelstech/feed/web3)             |
| [Zig](https://www.pixelstech.net/feed/zig)               | [zig](https://rsshub.app/pixelstech/feed/zig)               |

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
			source: ["www.pixelstech.net/feed/:topic?"],
			target: "/feed/:topic"
		},
		{
			title: "All",
			source: ["www.pixelstech.net/feed/"],
			target: "/feed"
		},
		{
			title: "AI",
			source: ["www.pixelstech.net/feed/ai"],
			target: "/feed/ai"
		},
		{
			title: "Alibaba",
			source: ["www.pixelstech.net/feed/alibaba"],
			target: "/feed/alibaba"
		},
		{
			title: "Apple",
			source: ["www.pixelstech.net/feed/apple"],
			target: "/feed/apple"
		},
		{
			title: "Database",
			source: ["www.pixelstech.net/feed/database"],
			target: "/feed/database"
		},
		{
			title: "Go",
			source: ["www.pixelstech.net/feed/go"],
			target: "/feed/go"
		},
		{
			title: "Huawei",
			source: ["www.pixelstech.net/feed/huawei"],
			target: "/feed/huawei"
		},
		{
			title: "Java",
			source: ["www.pixelstech.net/feed/java"],
			target: "/feed/java"
		},
		{
			title: "JavaScript",
			source: ["www.pixelstech.net/feed/javascript"],
			target: "/feed/javascript"
		},
		{
			title: "Linux",
			source: ["www.pixelstech.net/feed/linux"],
			target: "/feed/linux"
		},
		{
			title: "LLM",
			source: ["www.pixelstech.net/feed/llm"],
			target: "/feed/llm"
		},
		{
			title: "Nvidia",
			source: ["www.pixelstech.net/feed/nvidia"],
			target: "/feed/nvidia"
		},
		{
			title: "Python",
			source: ["www.pixelstech.net/feed/python"],
			target: "/feed/python"
		},
		{
			title: "Rust",
			source: ["www.pixelstech.net/feed/rust"],
			target: "/feed/rust"
		},
		{
			title: "Tesla",
			source: ["www.pixelstech.net/feed/tesla"],
			target: "/feed/tesla"
		},
		{
			title: "Web",
			source: ["www.pixelstech.net/feed/web"],
			target: "/feed/web"
		},
		{
			title: "Web3",
			source: ["www.pixelstech.net/feed/web3"],
			target: "/feed/web3"
		},
		{
			title: "Zig",
			source: ["www.pixelstech.net/feed/zig"],
			target: "/feed/zig"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
