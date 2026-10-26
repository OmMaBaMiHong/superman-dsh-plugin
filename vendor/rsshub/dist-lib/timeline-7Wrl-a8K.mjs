import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { i as rootUrl, n as parseArticle, r as parseResult, t as apiRootUrl } from "./utils-3sZ65Sbe.mjs";
//#region lib/routes/utgd/timeline.ts
const route = {
	path: "/timeline",
	categories: ["new-media"],
	example: "/utgd/timeline",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["utgd.net/"] }],
	name: "时间线",
	maintainers: ["nczitzk"],
	handler,
	url: "utgd.net/"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const list = parseResult((await rofetch(`${apiRootUrl}/api/v2/timeline/`, { query: {
		page: 1,
		page_size: limit
	} })).results, limit);
	return {
		title: "UNTAG",
		link: rootUrl,
		item: await Promise.all(list.map((item) => parseArticle(item)))
	};
}
//#endregion
export { route };
