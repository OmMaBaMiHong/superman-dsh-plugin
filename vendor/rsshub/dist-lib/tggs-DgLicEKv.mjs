import { t as createCsustHandler } from "./utils-BNKKVyZY.mjs";
const route = {
	path: "/tggs",
	categories: ["university"],
	example: "/csust/tggs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.csust.edu.cn/tggs.htm", "www.csust.edu.cn/"] }],
	name: "通告公示",
	maintainers: ["powerfullz"],
	handler: createCsustHandler({
		listPath: "/tggs.htm",
		feedTitle: "长沙理工大学 - 通告公示",
		feedDescription: "长沙理工大学通告公示"
	}),
	url: "www.csust.edu.cn/tggs.htm"
};
//#endregion
export { route };
