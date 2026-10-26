import { d as HOST, f as TITLE, n as fetchBrandInfo } from "./service-DBXx1TyI.mjs";
//#region lib/routes/showstart/brand.ts
const route = {
	path: "/brand/:id",
	categories: ["shopping"],
	example: "/showstart/brand/34707",
	parameters: { id: "厂牌 ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.showstart.com/host/:id"] }],
	name: "按厂牌 - 演出更新",
	maintainers: ["lchtao26"],
	handler,
	description: `::: tip
厂牌 ID 查询: \`/showstart/search/brand/:keyword\`，如: [https://rsshub.app/showstart/search/brand/ 声场](https://rsshub.app/showstart/search/brand/声场)
:::`
};
async function handler(ctx) {
	const brand = await fetchBrandInfo({ brandId: ctx.req.param("id") });
	return {
		title: `${TITLE} - ${brand.name}`,
		description: brand.content,
		link: `${HOST}/host/${brand.id}`,
		item: brand.activityList
	};
}
//#endregion
export { route };
