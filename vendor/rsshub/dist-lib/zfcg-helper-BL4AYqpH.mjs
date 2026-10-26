import { r as zfcgBaseUrl, t as getCategories } from "./utils-DxKTtH0j.mjs";
//#region lib/routes/gov/zj/czt/zfcg-helper.ts
const route = {
	path: "/zfcg-helper",
	categories: ["government"],
	example: "/gov/zj/zfcg-helper",
	name: "政府采购网分类代码",
	maintainers: ["TonyRL"],
	handler,
	url: "zfcg.czt.zj.gov.cn"
};
async function handler() {
	const categories = await getCategories();
	return {
		title: "浙江政府采购网 - 分类代码",
		link: `${zfcgBaseUrl}/site/category?parentId=600007&childrenCode=ZcyAnnouncement`,
		item: categories.map((category) => ({
			title: category.name,
			description: category.code,
			guid: String(category.id)
		}))
	};
}
//#endregion
export { route };
