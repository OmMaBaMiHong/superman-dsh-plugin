import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { n as rootUrl, t as processItems } from "./util-C0fjIWVZ.mjs";
import { load } from "cheerio";
//#region lib/routes/jisilu/topic.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`/topic/${id}`, rootUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").prop("lang") ?? "zh";
	const items = await processItems($, $("div.aw-question-list"), limit);
	$("div.pagination").remove();
	const author = $("meta[name=\"keywords\"]").prop("content").split(/,/, 1)[0];
	const feedImage = $("div.aw-logo img").prop("src");
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").prop("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: feedImage,
		author,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/topic/:id",
	name: "话题",
	url: "www.jisilu.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/jisilu/topic/可转债",
	parameters: { id: "话题 id，可在对应话题页 URL 中找到" },
	description: `::: tip
若订阅 [可转债](https://www.jisilu.cn/topic/可转债)，网址为 \`https://www.jisilu.cn/topic/可转债\`，请截取 \`https://www.jisilu.cn/topic/\` 到末尾的部分 \`可转债\` 作为 \`id\` 参数填入，此时目标路由为 [\`/jisilu/topic/可转债\`](https://rsshub.app/jisilu/topic/可转债)。
:::

::: tip
前往 [话题广场](https://www.jisilu.cn/topic) 查看更多话题。
:::`,
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
	radar: [{
		source: ["www.jisilu.cn/topic/:id"],
		target: "/topic/:id"
	}],
	view: 0
};
//#endregion
export { handler, route };
