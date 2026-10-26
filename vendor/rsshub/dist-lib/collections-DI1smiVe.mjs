import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { o as parseList, r as getCollection, t as ProcessFeed } from "./utils-Cov4AAq8.mjs";
//#region lib/routes/juejin/collections.ts
const route = {
	path: "/collections/:userId",
	categories: ["programming"],
	example: "/juejin/collections/1697301682482439",
	parameters: { userId: "用户唯一标志符, 在浏览器地址栏URL中能够找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["juejin.cn/user/:id", "juejin.cn/user/:id/collections"],
		target: "/collections/:id"
	}],
	name: "收藏集",
	maintainers: ["yang131323"],
	handler
};
async function getArticleList(collectionId) {
	return (await getCollection(collectionId)).article_list;
}
async function handler(ctx) {
	const userId = ctx.req.param("userId");
	const collectionId = (await rofetch(`https://api.juejin.cn/interact_api/v1/collectionSet/list?user_id=${userId}&cursor=0&limit=20`)).data.map((item) => item.tag_id);
	const result = await ProcessFeed(parseList((await Promise.all(collectionId.map((id) => getArticleList(id)))).flat().filter(Boolean)));
	return {
		title: "掘金 - 收藏集",
		link: `https://juejin.im/user/${userId}/collections`,
		description: "掘金，指定用户整个收藏集",
		item: result,
		allowEmpty: true
	};
}
//#endregion
export { route };
