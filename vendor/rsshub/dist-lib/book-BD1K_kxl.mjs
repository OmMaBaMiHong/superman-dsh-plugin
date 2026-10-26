import { n as getList, r as rootUrl, t as getItems } from "./utils-BYxKanwR.mjs";
//#region lib/routes/caareviews/book.ts
const route = {
	path: "/book",
	categories: ["journal"],
	example: "/caareviews/book",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["caareviews.org/reviews/book"] }],
	name: "Book Reviews",
	maintainers: ["Fatpandac"],
	handler,
	url: "caareviews.org/reviews/book"
};
async function handler(ctx) {
	const url = `${rootUrl}/reviews/book`;
	return {
		title: "Book Reviews",
		link: url,
		item: await getItems(ctx, await getList(url))
	};
}
//#endregion
export { route };
