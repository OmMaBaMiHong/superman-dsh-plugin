import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseItems } from "./parser-r2eHm_MD.mjs";
import { load } from "cheerio";
//#region lib/routes/collabo-cafe/index.ts
const handler = async () => {
	const baseUrl = "https://collabo-cafe.com/";
	return {
		title: "全部文章",
		link: baseUrl,
		item: parseItems(load(await rofetch(baseUrl)))
	};
};
const route = {
	path: "/",
	categories: ["anime"],
	example: "/collabo-cafe/",
	parameters: void 0,
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "全部文章",
	maintainers: ["cokemine"],
	handler
};
//#endregion
export { handler, route };
