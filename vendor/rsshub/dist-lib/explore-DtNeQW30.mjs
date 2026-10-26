import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { n as rootUrl, t as processItems } from "./util-C0fjIWVZ.mjs";
import { load } from "cheerio";
//#region lib/routes/jisilu/explore.ts
const handler = async (ctx) => {
	const { filter } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`/${filter ? "home/" : ""}explore/${filter ?? ""}`, rootUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").prop("lang") ?? "zh";
	const items = await processItems($, $("div.aw-question-list"), limit);
	$("div.pagination").remove();
	const author = $("meta[name=\"keywords\"]").prop("content").split(/,/, 1)[0];
	const feedImage = $("div.aw-logo img").prop("src");
	return {
		title: `${$("title").text()} - ${$("li.active").slice(1).toArray().map((l) => $(l).text()).join("|")}`,
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
	path: "/explore/:filter?",
	name: "广场",
	url: "www.jisilu.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/jisilu/explore",
	parameters: { category: "过滤器，默认为空，可在对应页 URL 中找到" },
	description: `::: tip
若订阅 [债券 / 可转债 - 热门 - 30 天](https://www.jisilu.cn/home/explore/category-4__sort_type-hot__day-30)，网址为 \`https://www.jisilu.cn/home/explore/category-4__sort_type-hot__day-30\`，请截取 \`https://www.jisilu.cn/home/explore/\` 到末尾的部分 \`category-4__sort_type-hot__day-30\` 作为 \`filter\` 参数填入，此时目标路由为 [\`/jisilu/explore/category-4__sort_type-hot__day-30\`](https://rsshub.app/jisilu/explore/category-4__sort_type-hot__day-30)。
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
		source: [
			"www.jisilu.cn/home/explore/:filter",
			"www.jisilu.cn/home/explore",
			"www.jisilu.cn/explore"
		],
		target: (params) => {
			const filter = params.filter;
			return `/jisilu/explore${filter ? `/${filter}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
