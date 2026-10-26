import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/dytt/index.ts
const domain = "www.dydytt.net";
const baseUrl = `https://${domain}`;
const handler = async (ctx) => {
	const { category = "gndy/dyzz" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "25");
	const targetUrl = new URL(`html/${category.replace(/^html\//, "")}`, baseUrl).href;
	const response = await rofetch(targetUrl, { responseType: "arrayBuffer" });
	const $ = load(iconv.decode(Buffer.from(response), "gb2312"));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("div.co_content8 ul table").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a.ulink");
		const title = $aEl.text();
		const description = $el.find("td").last().text();
		const pubDateStr = $el.find("font").last().text().split(/：/).pop();
		const linkUrl = $aEl.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			doi: $el.find("meta[name=\"citation_doi\"]").attr("content"),
			content: {
				html: description,
				text: description
			},
			updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailResponse = await rofetch(item.link, { responseType: "arrayBuffer" });
			const $$ = load(iconv.decode(Buffer.from(detailResponse), "gb2312"));
			const title = $$("div.title_all h1 font").text();
			const $descriptionEl = $$("div#Zoom span").first();
			const childEls = $descriptionEl.contents().toArray();
			const centerIdx = childEls.findIndex((node) => node.type === "tag" && node.name === "center");
			const description = (centerIdx === -1 ? childEls : childEls.slice(0, centerIdx)).map((node) => $.html(node)).join("");
			const pubDateStr = item.pubDate ? void 0 : $descriptionEl.prev().text().split(/：/).pop();
			const image = $descriptionEl.find("img").first().attr("src");
			const upDatedStr = pubDateStr;
			let processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			const $enclosureEl = $descriptionEl.find("a[href^=\"magnet:\"]").last();
			const enclosureUrl = $enclosureEl.attr("href");
			if (enclosureUrl) {
				const enclosureType = "application/x-bittorrent";
				const enclosureTitle = $enclosureEl.text();
				processedItem = {
					...processedItem,
					enclosure_url: enclosureUrl,
					enclosure_type: enclosureType,
					enclosure_title: enclosureTitle || title,
					enclosure_length: void 0,
					itunes_duration: void 0,
					itunes_item_image: image
				};
			}
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const title = $("title").text();
	return {
		title,
		description: $("META[name=description]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: new URL("images/logo.gif", baseUrl).href,
		author: title.split(/_/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:category{.+}?",
	name: "分类",
	url: domain,
	maintainers: ["junfengP", "nczitzk"],
	handler,
	example: "/dytt/gndy/dyzz",
	parameters: { category: {
		description: "分类，默认为 `gndy/dyzz`，即最新影片，可在对应分类页 URL 中找到",
		options: [
			{
				label: "最新影片",
				value: "gndy/dyzz"
			},
			{
				label: "经典影片",
				value: "gndy"
			},
			{
				label: "国内电影",
				value: "gndy/china"
			},
			{
				label: "欧美电影",
				value: "gndy/oumei"
			},
			{
				label: "其它电影",
				value: "gndy/rihan"
			},
			{
				label: "华语电视",
				value: "tv/hytv"
			},
			{
				label: "欧美电视",
				value: "tv/oumeitv"
			},
			{
				label: "最新综艺",
				value: "zongyi2013"
			},
			{
				label: "旧版综艺",
				value: "2009zongyi"
			},
			{
				label: "动漫资源",
				value: "dongman"
			},
			{
				label: "旧版游戏",
				value: "game"
			},
			{
				label: "游戏下载",
				value: "newgame"
			},
			{
				label: "日韩剧集专区",
				value: "tv/rihantv"
			}
		]
	} },
	description: `::: tip
若订阅 [最新影片](${baseUrl}/html/gndy/dyzz)，网址为 \`${baseUrl}/html/gndy/dyzz\`，请截取 \`${baseUrl}/html/\` 到末尾的部分 \`gndy/dyzz\` 作为 \`category\` 参数填入，此时目标路由为 [\`/dytt/gndy/dyzz\`](https://rsshub.app/dytt/gndy/dyzz)。
:::

<details>
<summary>更多分类</summary>

| 分类                                                  | ID                                               |
| ----------------------------------------------------- | ------------------------------------------------ |
| [最新影片](${baseUrl}/html/gndy/dyzz/index.html)      | [gndy/dyzz](https://rsshub.app/dytt/gndy/dyzz)   |
| [经典影片](${baseUrl}/html/gndy/index.html)           | [gndy](https://rsshub.app/dytt/gndy)             |
| [国内电影](${baseUrl}/html/gndy/china/index.html)     | [gndy/china](https://rsshub.app/dytt/gndy/china) |
| [欧美电影](${baseUrl}/html/gndy/oumei/index.html)     | [gndy/oumei](https://rsshub.app/dytt/gndy/oumei) |
| [其它电影](${baseUrl}/html/gndy/rihan/index.html)     | [gndy/rihan](https://rsshub.app/dytt/gndy/rihan) |
| [华语电视](${baseUrl}/html/tv/hytv/index.html)        | [tv/hytv](https://rsshub.app/dytt/tv/hytv)       |
| [欧美电视](${baseUrl}/html/tv/oumeitv/index.html)     | [tv/oumeitv](https://rsshub.app/dytt/tv/oumeitv) |
| [最新综艺](${baseUrl}/html/zongyi2013/index.html)     | [zongyi2013](https://rsshub.app/dytt/zongyi2013) |
| [旧版综艺](${baseUrl}/html/2009zongyi/index.html)     | [2009zongyi](https://rsshub.app/dytt/2009zongyi) |
| [动漫资源](${baseUrl}/html/dongman/index.html)        | [dongman](https://rsshub.app/dytt/dongman)       |
| [旧版游戏](${baseUrl}/html/game/index.html)           | [game](https://rsshub.app/dytt/game)             |
| [游戏下载](${baseUrl}/html/newgame/index.html)        | [newgame](https://rsshub.app/dytt/newgame)       |
| [日韩剧集专区](${baseUrl}/html/tv/rihantv/index.html) | [tv/rihantv](https://rsshub.app/dytt/tv/rihantv) |

</details>
`,
	categories: ["multimedia"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["${domain}/index.htm", `${domain}/html/:category`],
			target: (params) => {
				const category = params.category;
				return `/dytt/html${category ? `/${category}` : ""}`;
			}
		},
		{
			title: "最新影片",
			source: [`${baseUrl}/html/gndy/dyzz/index.html`],
			target: "/gndy/dyzz"
		},
		{
			title: "经典影片",
			source: [`${baseUrl}/html/gndy/index.html`],
			target: "/gndy"
		},
		{
			title: "国内电影",
			source: [`${baseUrl}/html/gndy/china/index.html`],
			target: "/gndy/china"
		},
		{
			title: "欧美电影",
			source: [`${baseUrl}/html/gndy/oumei/index.html`],
			target: "/gndy/oumei"
		},
		{
			title: "其它电影",
			source: [`${baseUrl}/html/gndy/rihan/index.html`],
			target: "/gndy/rihan"
		},
		{
			title: "华语电视",
			source: [`${baseUrl}/html/tv/hytv/index.html`],
			target: "/tv/hytv"
		},
		{
			title: "欧美电视",
			source: [`${baseUrl}/html/tv/oumeitv/index.html`],
			target: "/tv/oumeitv"
		},
		{
			title: "最新综艺",
			source: [`${baseUrl}/html/zongyi2013/index.html`],
			target: "/zongyi2013"
		},
		{
			title: "旧版综艺",
			source: [`${baseUrl}/html/2009zongyi/index.html`],
			target: "/2009zongyi"
		},
		{
			title: "动漫资源",
			source: [`${baseUrl}/html/dongman/index.html`],
			target: "/dongman"
		},
		{
			title: "旧版游戏",
			source: [`${baseUrl}/html/game/index.html`],
			target: "/game"
		},
		{
			title: "游戏下载",
			source: [`${baseUrl}/html/newgame/index.html`],
			target: "/newgame"
		},
		{
			title: "日韩剧集专区",
			source: [`${baseUrl}/html/tv/rihantv/index.html`],
			target: "/tv/rihantv"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
