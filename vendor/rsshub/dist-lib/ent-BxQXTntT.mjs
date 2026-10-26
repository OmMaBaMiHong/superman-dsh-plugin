import { a as mdTableBuilder, n as getArticleList, o as parseArticleList, t as getArticle } from "./utils-DwlQwnSZ.mjs";
//#region lib/routes/gamersky/ent.ts
const idNameMap = /* @__PURE__ */ new Map([
	["all", {
		title: "热点图文",
		suffix: "ent",
		nodeId: "20107"
	}],
	["qw", {
		title: "趣囧时间",
		suffix: "ent/qw",
		nodeId: "20113"
	}],
	["movie", {
		title: "游民影院",
		suffix: "wenku/movie",
		nodeId: "20111"
	}],
	["discovery", {
		title: "游观天下",
		suffix: "ent/discovery",
		nodeId: "20114"
	}],
	["wp", {
		title: "壁纸图库",
		suffix: "ent/wp",
		nodeId: "20117"
	}],
	["wenku", {
		title: "游民盘点",
		suffix: "wenku",
		nodeId: "20106"
	}],
	["xz", {
		title: "游民福利",
		suffix: "ent/xz",
		nodeId: "20119"
	}]
]);
const route = {
	path: "/ent/:category?",
	categories: ["game"],
	example: "/gamersky/ent/xz",
	parameters: { type: "分类类型，留空为 `all`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: Array.from(idNameMap, ([type, { title, suffix }]) => ({
		title,
		source: [`www.gamersky.com/${suffix}`],
		target: `/ent/${type}`
	})),
	name: "娱乐",
	maintainers: ["LogicJake"],
	description: mdTableBuilder(Array.from(idNameMap, ([type, { title, nodeId }]) => ({
		type,
		name: title,
		nodeId
	}))),
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "all";
	const idName = idNameMap.get(category);
	if (!idName) throw new Error(`Invalid type: ${category}`);
	const list = parseArticleList(await getArticleList(idName.nodeId));
	const fullTextList = await Promise.all(list.map((item) => getArticle(item)));
	return {
		title: `${idName.title} - 游民娱乐`,
		link: `https://www.gamersky.com/${idName.suffix}`,
		item: fullTextList
	};
}
//#endregion
export { route };
