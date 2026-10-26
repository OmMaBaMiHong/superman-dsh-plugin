import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { i as rootUrl, n as language, r as processItems, t as author } from "./util-CvPOkvoe.mjs";
//#region lib/routes/ifun/n/category.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = rootUrl;
	const apiUrl = new URL(`api/articles/${id ? "categoryId" : "all"}`, rootUrl).href;
	const apiCategoryUrl = new URL("api/categories/all", rootUrl).href;
	const apiResponse = await rofetch(apiUrl, { query: {
		datasrc: id ? "categoriesall" : "articles",
		current: 1,
		size: limit,
		categoryId: id
	} });
	const categoryName = (await rofetch(apiCategoryUrl, { query: { datasrc: "categories" } })).data.find((item) => item.categoryid === id)?.category;
	const items = processItems(apiResponse.data.records, limit);
	return {
		title: `${author}${categoryName ? ` - ${categoryName}` : ""}`,
		description: categoryName,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author,
		language
	};
};
const route = {
	path: "/n/category/:id?",
	name: "盐选故事分类",
	url: "n.ifun.cool",
	maintainers: ["nczitzk"],
	handler,
	example: "/ifun/n/category",
	parameters: { id: "分类 id，默认为空，即全部，见下表" },
	description: `| 名称     | ID |
| -------- | -- |
| 全部     |    |
| 通告     | 1  |
| 故事盐选 | 2  |
| 趣集精选 | 3  |`,
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
			source: ["n.ifun.cool"],
			target: "/n/category/:id?"
		},
		{
			title: "全部",
			source: ["n.ifun.cool"],
			target: "/n/category"
		},
		{
			title: "通告",
			source: ["n.ifun.cool"],
			target: "/n/category/1"
		},
		{
			title: "盐选故事",
			source: ["n.ifun.cool"],
			target: "/n/category/2"
		},
		{
			title: "趣集精选",
			source: ["n.ifun.cool"],
			target: "/n/category/3"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
