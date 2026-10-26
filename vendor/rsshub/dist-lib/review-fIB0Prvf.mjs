import { a as mdTableBuilder, n as getArticleList, o as parseArticleList, t as getArticle } from "./utils-DwlQwnSZ.mjs";
//#region lib/routes/gamersky/review.ts
const idNameMap = [
	{
		type: "pc",
		name: "单机",
		nodeId: "20465"
	},
	{
		type: "tv",
		name: "电视",
		nodeId: "20466"
	},
	{
		type: "indie",
		name: "独立游戏",
		nodeId: "20922"
	},
	{
		type: "web",
		name: "网游",
		nodeId: "20916"
	},
	{
		type: "mobile",
		name: "手游",
		nodeId: "20917"
	},
	{
		type: "all",
		name: "全部评测",
		nodeId: "20915"
	}
];
const route = {
	path: "/review/:type?",
	categories: ["game"],
	example: "/gamersky/review/pc",
	parameters: { type: "评测类型，可选值为 `pc`、`tv`、`indie`、`web`、`mobile`、`all`，默认为 `pc`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.gamersky.com/review"],
		target: "/review"
	}],
	name: "评测",
	maintainers: ["yy4382"],
	description: mdTableBuilder(idNameMap),
	handler
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "pc";
	const idName = idNameMap.find((item) => item.type === type);
	if (!idName) throw new Error(`Invalid type: ${type}`);
	const list = parseArticleList(await getArticleList(idName.nodeId));
	const fullTextList = await Promise.all(list.map((item) => getArticle(item)));
	return {
		title: `${idName.name} - 游民星空评测`,
		link: "https://www.gamersky.com/review",
		item: fullTextList
	};
}
//#endregion
export { route };
