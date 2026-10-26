import { t as fetchFeed } from "./utils-INacok5b.mjs";
//#region lib/routes/ruancan/search.ts
const route = {
	path: "/search/:keyword?",
	categories: ["new-media"],
	example: "/ruancan/search/Windows",
	parameters: { keyword: "关键字，默认为空" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ruancan.com/"],
		target: ""
	}],
	name: "搜索",
	maintainers: [],
	handler,
	url: "ruancan.com/"
};
async function handler(ctx) {
	return await fetchFeed(ctx, `/?s=${ctx.req.param("keyword")}`);
}
//#endregion
export { route };
