import { r as rootUrl, t as ProcessItems } from "./utils-DlON7c1Q.mjs";
//#region lib/routes/yicai/headline.ts
const route = {
	path: "/headline",
	categories: ["traditional-media"],
	example: "/yicai/headline",
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
	name: "头条",
	maintainers: ["nczitzk"],
	handler,
	url: "yicai.com/"
};
async function handler(ctx) {
	return {
		title: "第一财经 - 头条",
		link: rootUrl,
		item: await ProcessItems(`${rootUrl}/api/ajax/getlistbycid?cid=48&type=1&page=1&pagesize=${ctx.req.query("limit") ?? 30}`)
	};
}
//#endregion
export { route };
