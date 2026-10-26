import { a as fetchDictionary, d as HOST, f as TITLE, t as fetchActivityList } from "./service-DBXx1TyI.mjs";
//#region lib/routes/showstart/event.ts
const route = {
	path: "/event/:cityCode/:showStyle?",
	categories: ["shopping"],
	example: "/showstart/event/571/3",
	parameters: {
		cityCode: "演出城市 (编号)",
		showStyle: "演出风格 (编号)"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "按城市 - 演出更新",
	maintainers: ["lchtao26"],
	handler,
	description: `::: tip

- 演出城市 \`cityCode\` 查询: \`/showstart/search/city/:keyword\`, 如: [https://rsshub.app/showstart/search/city/ 杭州](https://rsshub.app/showstart/search/city/杭州)

- 演出风格 \`showStyle\` 查询: \`/showstart/search/style/:keyword\`，如: [https://rsshub.app/showstart/search/style/ 摇滚](https://rsshub.app/showstart/search/style/摇滚)

:::`
};
async function handler(ctx) {
	const cityCode = Number.parseInt(ctx.req.param("cityCode")).toString();
	const showStyle = Number.parseInt(ctx.req.param("showStyle")).toString();
	const items = await fetchActivityList({
		cityCode,
		showStyle
	});
	const { cityName, showName } = await fetchDictionary(cityCode, showStyle);
	return {
		title: `${TITLE} - ${[cityName, showName].filter(Boolean).join(" - ")}`,
		link: HOST,
		item: items
	};
}
//#endregion
export { route };
