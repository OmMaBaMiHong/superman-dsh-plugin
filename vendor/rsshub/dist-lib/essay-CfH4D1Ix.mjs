import { n as getList, r as rootUrl, t as getItems } from "./utils-BYxKanwR.mjs";
//#region lib/routes/caareviews/essay.ts
const route = {
	path: "/essay",
	categories: ["journal"],
	example: "/caareviews/essay",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["caareviews.org/reviews/essay"] }],
	name: "Essays",
	maintainers: ["Fatpandac"],
	handler,
	url: "caareviews.org/reviews/essay"
};
async function handler(ctx) {
	const url = `${rootUrl}/reviews/essay`;
	return {
		title: "Essays",
		link: url,
		item: await getItems(ctx, await getList(url))
	};
}
//#endregion
export { route };
