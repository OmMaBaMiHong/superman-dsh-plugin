import { d as HOST, f as TITLE, o as fetchPerformerInfo } from "./service-DBXx1TyI.mjs";
//#region lib/routes/showstart/artist.ts
const route = {
	path: "/artist/:id",
	categories: ["shopping"],
	example: "/showstart/artist/301783",
	parameters: { id: "音乐人 ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.showstart.com/artist/:id"] }],
	name: "按音乐人 - 演出更新",
	maintainers: ["lchtao26"],
	handler,
	description: `::: tip
音乐人 ID 查询: \`/showstart/search/artist/:keyword\`，如: [https://rsshub.app/showstart/search/artist/ 周杰伦](https://rsshub.app/showstart/search/artist/周杰伦)
:::`
};
async function handler(ctx) {
	const artist = await fetchPerformerInfo({ performerId: ctx.req.param("id") });
	return {
		title: `${TITLE} - ${artist.name}`,
		description: artist.content,
		link: `${HOST}/artist/${artist.id}`,
		item: artist.activityList,
		allowEmpty: true
	};
}
//#endregion
export { route };
