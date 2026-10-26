import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { r as baseUrl, t as ProcessFeedItems } from "./util-DNrH-n99.mjs";
import { load } from "cheerio";
//#region lib/routes/dgtle/tag.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "10");
	const targetUrl = new URL(`tag-${id}-1.html`, baseUrl).href;
	const apiUrl = new URL(`tag/getDynamicList/${id}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	const items = ProcessFeedItems(limit, (await rofetch(apiUrl, { query: {
		page: 1,
		type: 2
	} })).data.dataList, $);
	const title = $("div.tags-detail-top-1 h2").text();
	return {
		title: `${$("title").text().trim().split(/\s/, 1)[0]}${title ? ` - ${title}` : id}`,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: $("meta[name=\"keywords\"]").attr("content")?.split(/,/, 1)[0] ?? void 0,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/tag/:id",
	name: "标签",
	url: "www.dgtle.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/dgtle/tag/394",
	parameters: { id: { description: "标签 ID，可在对应标签页 URL 中找到" } },
	description: `::: tip
订阅 [#手机讨论区](https://www.dgtle.com/tag-394-1.html)，其源网址为 \`https://www.dgtle.com/tag-394-1.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/dgtle/tag/394\`](https://rsshub.app/dgtle/tag/394)。
:::`,
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
	radar: [{
		source: [String.raw`www.dgtle.com/$tag-:id-\d+.html`],
		target: "/tag/:id"
	}],
	view: 0
};
//#endregion
export { handler, route };
