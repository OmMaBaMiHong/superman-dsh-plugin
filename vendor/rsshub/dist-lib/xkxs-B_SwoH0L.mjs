import { t as createCsustHandler } from "./utils-BNKKVyZY.mjs";
const route = {
	path: "/xkxs",
	categories: ["university"],
	example: "/csust/xkxs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.csust.edu.cn/xkxs.htm", "www.csust.edu.cn/"] }],
	name: "学科学术",
	maintainers: ["powerfullz"],
	handler: createCsustHandler({
		listPath: "/xkxs.htm",
		feedTitle: "长沙理工大学 - 学科学术",
		feedDescription: "长沙理工大学学科学术"
	}),
	url: "www.csust.edu.cn/xkxs.htm"
};
//#endregion
export { route };
