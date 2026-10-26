import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { i as rootUrl, n as language, r as processItems, t as author } from "./util-CvPOkvoe.mjs";
//#region lib/routes/ifun/n/search.ts
const handler = async (ctx) => {
	const { keywords } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`search-result/?s=${keywords}`, rootUrl).href;
	const apiUrl = new URL("api/articles/searchkeywords", rootUrl).href;
	const items = processItems((await rofetch(apiUrl, { query: {
		keywords,
		current: 1,
		size: limit
	} })).data.records, limit);
	return {
		title: `${author} - ${keywords}`,
		description: keywords,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author,
		language
	};
};
const route = {
	path: "/n/search/:keywords",
	name: "盐选故事搜索",
	url: "n.ifun.cool",
	maintainers: ["nczitzk"],
	handler,
	example: "/ifun/n/search/NPC",
	parameters: { keywords: "搜索关键字" },
	description: `::: tip
若订阅 [关键词：NPC](https://n.ifun.cool/search-result/?s=NPC)，网址为 \`https://n.ifun.cool/search-result/?s=NPC\`，请截取 \`s\` 的值 \`NPC\` 作为 \`keywords\` 参数填入，此时目标路由为 [\`/ifun/n/search/NPC\`](https://rsshub.app/ifun/n/search/NPC)。
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
		source: ["n.ifun.cool/search-result"],
		target: (_, url) => {
			return `/ifun/n/search/${new URL(url).searchParams.get("s")}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
