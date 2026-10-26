import { r as rootUrl, t as ProcessItems } from "./utils-DlON7c1Q.mjs";
//#region lib/routes/yicai/latest.ts
const route = {
	path: "/latest",
	categories: ["traditional-media"],
	example: "/yicai/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yicai.com/"] }],
	name: "最新",
	maintainers: ["nczitzk"],
	handler,
	url: "yicai.com/"
};
async function handler(ctx) {
	return {
		title: "第一财经 - 最新",
		link: rootUrl,
		item: await ProcessItems(`${rootUrl}/api/ajax/getlatest?page=1&pagesize=${ctx.req.query("limit") ?? 30}`)
	};
}
//#endregion
export { route };
