import { t as FetchGoItems } from "./utils-v_N73tfK2.mjs";
//#region lib/routes/studygolang/jobs.ts
const route = {
	path: "/jobs",
	categories: ["programming"],
	example: "/studygolang/jobs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "招聘",
	maintainers: ["CcccFz", "nczitzk"],
	handler
};
async function handler(ctx) {
	return await FetchGoItems(ctx, "jobs");
}
//#endregion
export { route };
