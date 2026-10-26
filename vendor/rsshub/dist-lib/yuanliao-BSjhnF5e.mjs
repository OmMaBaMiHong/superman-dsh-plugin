import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/yuanliao/index.ts
const handler = async (ctx) => {
	const { tag } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://yuanliao.info";
	const apiUrl = new URL("api/discussions", baseUrl).href;
	const targetUrl = new URL(tag ? `t/${tag}` : "", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	const response = await rofetch(apiUrl, { query: {
		include: "user,firstPost,tags",
		"filter[q]": tag ? `tag:${tag}` : "",
		sort: "",
		"page[offset]": ""
	} });
	const includedMap = /* @__PURE__ */ new Map();
	for (const item of response.included) includedMap.set(`${item.type}-${item.id}`, item);
	const items = response.data.slice(0, limit).map((item) => {
		const attributes = item.attributes;
		const relationships = item.relationships;
		const title = attributes.title;
		const firstPostData = relationships?.firstPost?.data;
		const description = firstPostData?.type && firstPostData.id ? includedMap.get(`${firstPostData.type}-${firstPostData.id}`)?.attributes?.contentHtml : void 0;
		const pubDate = attributes.createdAt;
		const linkUrl = item.id ? `d/${item.id}` : void 0;
		const categories = [...new Set(relationships?.tags?.data?.map((tag) => `${tag.type}-${tag.id}`)?.map((key) => includedMap.get(key)?.attributes?.name))].filter(Boolean);
		const userData = relationships?.user?.data;
		const userAttributes = userData && userData.type && userData.id ? includedMap.get(`${userData.type}-${userData.id}`)?.attributes : void 0;
		const authors = userAttributes ? [{
			name: userAttributes.displayName,
			url: userAttributes.username ? new URL(`u/${userAttributes.username}`, baseUrl).href : void 0,
			avatar: userAttributes.avatarUrl
		}] : void 0;
		const guid = `yuanliao-${item.id}`;
		const updated = attributes.lastPostedAt ?? pubDate;
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
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.Header-logo").attr("src"),
		author: $("img.Header-logo").attr("alt"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:tag?",
	name: "主题",
	url: "yuanliao.info",
	maintainers: ["nczitzk"],
	handler,
	example: "/yuanliao",
	parameters: { tag: {
		description: "标签，默认为全部，可在对应标签页 URL 中找到",
		options: [
			{
				label: "问题反馈",
				value: "bug-report"
			},
			{
				label: "Windows",
				value: "windows"
			},
			{
				label: "macOS",
				value: "macos"
			},
			{
				label: "Linux",
				value: "linux"
			},
			{
				label: "意见建议",
				value: "suggestions"
			},
			{
				label: "插件发布",
				value: "plugins"
			},
			{
				label: "插件需求",
				value: "plugin-needs"
			},
			{
				label: "开发者",
				value: "developers"
			}
		]
	} },
	description: `::: tip
订阅 [问题反馈](https://yuanliao.info/t/bug-report)，其源网址为 \`https://yuanliao.info/t/bug-report\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/yuanliao/bug-report\`](https://rsshub.app/yuanliao/bug-report)。
:::

| 标签                                             | id                                                       |
| ------------------------------------------------ | -------------------------------------------------------- |
| [问题反馈](https://yuanliao.info/t/bug-report)   | [bug-report](https://rsshub.app/yuanliao/bug-report)     |
| [Windows](https://yuanliao.info/t/windows)       | [windows](https://rsshub.app/yuanliao/windows)           |
| [macOS](https://yuanliao.info/t/macos)           | [macos](https://rsshub.app/yuanliao/macos)               |
| [Linux](https://yuanliao.info/t/linux)           | [linux](https://rsshub.app/yuanliao/linux)               |
| [意见建议](https://yuanliao.info/t/suggestions)  | [suggestions](https://rsshub.app/yuanliao/suggestions)   |
| [插件发布](https://yuanliao.info/t/plugins)      | [plugins](https://rsshub.app/yuanliao/plugins)           |
| [插件需求](https://yuanliao.info/t/plugin-needs) | [plugin-needs](https://rsshub.app/yuanliao/plugin-needs) |
| [开发者](https://yuanliao.info/t/developers)     | [developers](https://rsshub.app/yuanliao/developers)     |`,
	categories: ["bbs"],
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
			source: ["yuanliao.info", "yuanliao.info/t/:tag"],
			target: (params) => {
				const tag = params.tag;
				return `/yuanliao${tag ? `/${tag}` : ""}`;
			}
		},
		{
			title: "问题反馈",
			source: ["yuanliao.info/t/bug-report"],
			target: "/bug-report"
		},
		{
			title: "Windows",
			source: ["yuanliao.info/t/windows"],
			target: "/windows"
		},
		{
			title: "macOS",
			source: ["yuanliao.info/t/macos"],
			target: "/macos"
		},
		{
			title: "Linux",
			source: ["yuanliao.info/t/linux"],
			target: "/linux"
		},
		{
			title: "意见建议",
			source: ["yuanliao.info/t/suggestions"],
			target: "/suggestions"
		},
		{
			title: "插件发布",
			source: ["yuanliao.info/t/plugins"],
			target: "/plugins"
		},
		{
			title: "插件需求",
			source: ["yuanliao.info/t/plugin-needs"],
			target: "/plugin-needs"
		},
		{
			title: "开发者",
			source: ["yuanliao.info/t/developers"],
			target: "/developers"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
