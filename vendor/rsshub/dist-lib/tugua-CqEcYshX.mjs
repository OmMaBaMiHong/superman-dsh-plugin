import { t as utils_default } from "./utils-D9CQ324O2.mjs";
//#region lib/routes/dapenti/tugua.ts
const route = {
	path: "/tugua",
	categories: ["picture"],
	example: "/dapenti/tugua",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "图卦",
	maintainers: ["tgly307"],
	handler
};
async function handler() {
	return await utils_default.parseFeed({ subjectid: 70 });
}
//#endregion
export { route };
