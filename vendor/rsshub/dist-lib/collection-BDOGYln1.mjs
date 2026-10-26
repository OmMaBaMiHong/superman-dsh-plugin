import { o as parseList, r as getCollection, t as ProcessFeed } from "./utils-Cov4AAq8.mjs";
//#region lib/routes/juejin/collection.ts
const route = {
	path: "/collection/:collectionId",
	categories: ["programming"],
	example: "/juejin/collection/6845243180586123271",
	parameters: { collectionId: "收藏夹唯一标志符, 在浏览器地址栏URL中能够找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["juejin.cn/collection/:collectionId"] }],
	name: "单个收藏夹",
	maintainers: ["yang131323"],
	handler
};
async function handler(ctx) {
	const collectionId = ctx.req.param("collectionId");
	const collectPage = await getCollection(collectionId);
	const result = await ProcessFeed(parseList(collectPage.article_list));
	return {
		title: `${collectPage.detail.tag_name} - ${collectPage.create_user.user_name}的收藏集 - 掘金`,
		link: `https://juejin.cn/collection/${collectionId}`,
		description: "掘金，用户单个收藏夹",
		item: result,
		allowEmpty: true
	};
}
//#endregion
export { route };
