import "./types-DNj6Etbg.mjs";
import { r as processItems, t as baseUrl } from "./util-n4gNRv9n.mjs";
//#region lib/routes/gcores/tags.ts
let viewType = 0;
const handler = async (ctx) => {
	const { id, tab } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`tags/${id}/originals${tab ? `?tab=${tab}` : ""}`, baseUrl).href;
	const apiUrl = new URL(`gapi/v1/tags/${id}/${tab ?? "originals"}`, baseUrl).href;
	const query = {
		"page[limit]": limit,
		sort: "-published-at",
		include: "category,user,media",
		"filter[list-all]": 1,
		"filter[is-news]": tab === "news" ? 1 : 0
	};
	if (tab === "radios") viewType = 4;
	else if (tab === "videos") viewType = 3;
	return await processItems(limit, query, apiUrl, targetUrl);
};
const route = {
	path: "/tags/:id/:tab?",
	name: "标签",
	url: "www.gcores.com",
	maintainers: ["StevenRCE0", "nczitzk"],
	handler,
	example: "/gcores/tags/1/articles",
	parameters: {
		id: { description: "标签 ID，可在对应标签页 URL 中找到" },
		tab: {
			description: "类型，默认为空，即全部，可在对应标签页 URL 中找到",
			options: [
				{
					label: "全部",
					value: ""
				},
				{
					label: "播客",
					value: "radios"
				},
				{
					label: "文章",
					value: "articles"
				},
				{
					label: "资讯",
					value: "news"
				},
				{
					label: "视频",
					value: "videos"
				}
			]
		}
	},
	description: `::: tip
若订阅 [美国 - 文章](https://www.gcores.com/tags/1/originals?tab=articles)，网址为 \`https://www.gcores.com/tags/1/originals?tab=articles\`，请截取 \`https://www.gcores.com/tags/\` 到末尾 \`/originals\` 的部分 \`1\` 作为 \`id\` 参数填入，截取 \`articles\` 作为 \`tab\` 参数填入，此时目标路由为 [\`/gcores/tags/1/articles\`](https://rsshub.app/gcores/tags/1/articles)。
:::

| 全部 | 播客   | 文章     | 资讯 | 视频   |
| ---- | ------ | -------- | ---- | ------ |
|      | radios | articles | news | videos |`,
	categories: ["game"],
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
			source: ["www.gcores.com/tags/:id/originals"],
			target: (params, url) => {
				const urlObj = new URL(url);
				const id = params.id;
				const tab = urlObj.searchParams.get("tab") ?? void 0;
				return `/gcores/tags/${id}/${tab ? `/${tab}` : ""}`;
			}
		},
		{
			title: "全部",
			source: ["www.gcores.com/tags/:id/originals"],
			target: "/gcores/tags/:id"
		},
		{
			title: "播客",
			source: ["www.gcores.com/tags/:id/originals"],
			target: "/gcores/tags/:id/radios"
		},
		{
			title: "文章",
			source: ["www.gcores.com/tags/:id/originals"],
			target: "/gcores/tags/:id/articles"
		},
		{
			title: "资讯",
			source: ["www.gcores.com/tags/:id/originals"],
			target: "/gcores/tags/:id/news"
		},
		{
			title: "视频",
			source: ["www.gcores.com/tags/:id/originals"],
			target: "/gcores/tags/:id/videos"
		}
	],
	view: viewType
};
//#endregion
export { handler, route };
