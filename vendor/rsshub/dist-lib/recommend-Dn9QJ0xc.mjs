import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-Dx81NiL3.mjs";
//#region lib/routes/infoq/recommend.ts
const route = {
	path: "/recommend",
	categories: ["new-media"],
	example: "/infoq/recommend",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["infoq.cn/"] }],
	name: "推荐",
	maintainers: ["brilon"],
	handler,
	url: "infoq.cn/"
};
async function handler(ctx) {
	const apiUrl = "https://www.infoq.cn/public/v1/my/recommond";
	const pageUrl = "https://www.infoq.cn";
	const data = (await got_default.post(apiUrl, {
		headers: { Referer: pageUrl },
		json: { size: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30 }
	})).data.data;
	return {
		title: "InfoQ 推荐",
		link: pageUrl,
		item: await utils_default.ProcessFeed(data, cache_default)
	};
}
//#endregion
export { route };
