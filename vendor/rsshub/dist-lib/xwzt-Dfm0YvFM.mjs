import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/chnmuseum/xwzt.ts
const route = {
	path: "/zx/xwzt",
	categories: ["travel"],
	example: "/chnmuseum/zx/xwzt",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["chnmuseum.cn/zx/xwzt"],
		target: "/zx/xwzt"
	}],
	name: "资讯专题",
	maintainers: ["ShabbyWhineYear"],
	handler: async () => {
		const $ = load(await rofetch("https://www.chnmuseum.cn/zx/xwzt/"));
		return {
			title: "中国国家博物馆资讯专题",
			link: "https://www.chnmuseum.cn/zx/xwzt/",
			item: $("ul.cj_hd_zhanh li").toArray().map((item) => {
				item = $(item);
				const a = item.find("div.cj_hd_biaoti a").first();
				return {
					title: a.attr("title") || a.text(),
					link: new URL(a.attr("href"), "https://www.chnmuseum.cn").href
				};
			})
		};
	}
};
//#endregion
export { route };
