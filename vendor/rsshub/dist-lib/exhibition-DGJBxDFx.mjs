import { n as getList, r as rootUrl, t as getItems } from "./utils-BYxKanwR.mjs";
//#region lib/routes/caareviews/exhibition.ts
const route = {
	path: "/exhibition",
	categories: ["journal"],
	example: "/caareviews/exhibition",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["caareviews.org/reviews/exhibition"] }],
	name: "Exhibition Reviews",
	maintainers: ["Fatpandac"],
	handler,
	url: "caareviews.org/reviews/exhibition"
};
async function handler(ctx) {
	const url = `${rootUrl}/reviews/exhibition`;
	return {
		title: "Exhibition Reviews",
		link: url,
		item: await getItems(ctx, await getList(url))
	};
}
//#endregion
export { route };
