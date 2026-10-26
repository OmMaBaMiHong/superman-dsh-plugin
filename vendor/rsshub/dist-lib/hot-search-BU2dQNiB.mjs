import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as utils_default } from "./utils-BLUZ3MUn.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/hot-search.ts
const route = {
	path: "/hot-search",
	categories: ["social-media"],
	example: "/bilibili/hot-search",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.bilibili.com/"] }, { source: ["m.bilibili.com/"] }],
	name: "热搜",
	maintainers: ["CaoMeiYouRen"],
	handler,
	url: "www.bilibili.com/"
};
async function handler() {
	const wbiVerifyString = await cache_default.getWbiVerifyString();
	const url = `https://api.bilibili.com/x/web-interface/wbi/search/square?${utils_default.addWbiVerifyInfo("limit=10&platform=web", wbiVerifyString)}`;
	const trending = (await got_default({
		method: "get",
		url,
		headers: { Referer: "https://api.bilibili.com" }
	}))?.data?.data?.trending;
	return {
		title: trending?.title,
		link: url,
		description: "bilibili热搜",
		item: (trending?.list || []).map((item) => ({
			title: item.keyword,
			description: `${item.keyword}<br>${item.icon ? `<img src="${item.icon}">` : ""}`,
			link: item.link || item.goto || `https://search.bilibili.com/all?${new URLSearchParams({ keyword: item.keyword })}&from_source=webtop_search`
		}))
	};
}
//#endregion
export { route };
