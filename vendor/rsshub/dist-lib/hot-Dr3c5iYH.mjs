import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as apiRootUrl, r as rootUrl, t as ProcessItems } from "./utils-fTxO48rM.mjs";
//#region lib/routes/hk01/hot.ts
const route = {
	path: "/hot",
	categories: ["new-media"],
	example: "/hk01/hot",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hk01.com/hot", "hk01.com/"] }],
	name: "热门",
	maintainers: [
		"hoilc",
		"Fatpandac",
		"nczitzk"
	],
	handler,
	url: "hk01.com/hot"
};
async function handler(ctx) {
	return {
		title: "熱門新聞、全城熱話及社會時事 | 香港01",
		link: `${rootUrl}/hot`,
		item: await ProcessItems((await got_default({
			method: "get",
			url: `${apiRootUrl}/v2/feed/hot`
		})).data.items, ctx.req.query("limit"))
	};
}
//#endregion
export { route };
