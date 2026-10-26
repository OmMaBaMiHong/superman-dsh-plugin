import { n as getBoards, t as baseUrl } from "./utils-B0pO1Uj-2.mjs";
//#region lib/routes/meteor/boards.ts
const route = {
	path: "/boards",
	categories: ["bbs"],
	example: "/meteor/boards",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["meteor.today/"] }],
	name: "看板列表",
	maintainers: ["TonyRL"],
	handler,
	url: "meteor.today/"
};
async function handler() {
	const items = await getBoards();
	return {
		title: "看板列表",
		link: `${baseUrl}/board/all`,
		item: items
	};
}
//#endregion
export { route };
