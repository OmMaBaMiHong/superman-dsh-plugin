import { t as FetchGoItems } from "./utils-v_N73tfK2.mjs";
//#region lib/routes/studygolang/weekly.ts
const route = {
	path: "/weekly",
	categories: ["programming"],
	example: "/studygolang/weekly",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "周刊",
	maintainers: ["CWeilet", "nczitzk"],
	handler
};
async function handler(ctx) {
	return await FetchGoItems(ctx, "weekly");
}
//#endregion
export { route };
