import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as apiRootUrl, r as rootUrl, t as ProcessItems } from "./utils-fTxO48rM.mjs";
//#region lib/routes/hk01/latest.ts
const route = {
	path: "/latest",
	categories: ["new-media"],
	example: "/hk01/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hk01.com/latest", "hk01.com/"] }],
	name: "即時",
	maintainers: ["5upernova-heng"],
	handler,
	url: "hk01.com/latest"
};
async function handler(ctx) {
	return {
		title: "即時 | 香港01",
		link: `${rootUrl}/latest`,
		item: await ProcessItems((await got_default({
			method: "get",
			url: `${apiRootUrl}/v2/page/latest`
		})).data.items, ctx.req.query("limit"))
	};
}
//#endregion
export { route };
