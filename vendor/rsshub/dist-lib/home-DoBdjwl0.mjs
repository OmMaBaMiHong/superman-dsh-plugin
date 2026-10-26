import { t as getItems } from "./utils-C7cObgR4.mjs";
//#region lib/routes/jou/home.ts
const url = "https://www.jou.edu.cn/index/tzgg.htm";
const host = "https://www.jou.edu.cn";
const route = {
	path: "/tzgg",
	categories: ["university"],
	example: "/jou/tzgg",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.jou.edu.cn/index/tzgg.htm", "www.jou.edu.cn/"] }],
	name: "官网通知公告",
	maintainers: ["real-jiakai"],
	handler,
	url: "www.jou.edu.cn/index/tzgg.htm"
};
async function handler(ctx) {
	const out = await getItems(ctx, url, host, "winstyle106390", "timestyle106390", "titlestyle106402", "timestyle106402");
	return {
		title: "江苏海洋大学 -- 通知公告",
		link: url,
		item: out
	};
}
//#endregion
export { route };
