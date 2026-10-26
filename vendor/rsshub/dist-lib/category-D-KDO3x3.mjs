import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as getCategoryBrief, o as parseList, t as ProcessFeed } from "./utils-Cov4AAq8.mjs";
//#region lib/routes/juejin/category.ts
const route = {
	path: "/category/:category",
	categories: ["programming"],
	example: "/juejin/category/frontend",
	parameters: { category: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["juejin.cn/:category"] }],
	name: "分类",
	maintainers: ["DIYgod"],
	handler,
	description: `| 后端    | 前端     | Android | iOS | 人工智能 | 开发工具 | 代码人生 | 阅读    |
| ------- | -------- | ------- | --- | -------- | -------- | -------- | ------- |
| backend | frontend | android | ios | ai       | freebie  | career   | article |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const cat = (await getCategoryBrief()).find((item) => item.category_url === category);
	if (!cat) throw new Error("分类不存在");
	const id = cat.category_id;
	const resultItems = await ProcessFeed(parseList((await rofetch("https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed", {
		method: "POST",
		body: {
			id_type: 2,
			sort_type: 300,
			cate_id: id,
			cursor: "0",
			limit: 20
		}
	})).data));
	return {
		title: `掘金 ${cat.category_name}`,
		link: `https://juejin.cn/${category}`,
		description: `掘金 ${cat.category_name}`,
		item: resultItems
	};
}
//#endregion
export { route };
