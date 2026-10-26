import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#endregion
//#region lib/routes/chongdiantou/index.ts
const route = {
	path: "/",
	categories: {
		name: "充电头网",
		url: "www.chongdiantou.com",
		categories: ["new-media"],
		lang: "zh-CN",
		description: "充电头网是国内最早进行消费类电源技术及其周边配件（快充、充电头、充电器、无线充、车充、车载充电器、数据线、充电线材、移动电源及电芯、USB 插排）评测、拆解的专业机构。"
	}.categories,
	example: "/chongdiantou",
	radar: [{ source: ["www.chongdiantou.com"] }],
	name: "最新资讯",
	maintainers: ["Geraldxm"],
	handler,
	url: "www.chongdiantou.com"
};
async function handler() {
	const response = await rofetch("https://www.chongdiantou.com/nice-json/front-end/home-load-more");
	let items;
	items = response.data.map((item) => ({
		title: item.title,
		link: item.link,
		image: item.cover,
		pubDate: new Date(item.time),
		category: item.cat.name
	}));
	items = await Promise.all(items.map(async (item) => await cache_default.tryGet(item.link, async () => {
		try {
			item.description = load(await rofetch(item.link))(".post-content").html() || "No content found";
		} catch {
			item.description = "Failed to fetch content";
		}
		return item;
	})));
	return {
		title: "充电头网 - 最新资讯",
		description: "充电头网新闻资讯",
		link: "https://www.chongdiantou.com",
		image: "https://static.chongdiantou.com/wp-content/uploads/2021/02/2021021806172389.png",
		item: items
	};
}
//#endregion
export { route };
