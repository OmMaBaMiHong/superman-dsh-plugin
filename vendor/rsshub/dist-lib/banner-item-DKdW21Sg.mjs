import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hpoi/banner-item.ts
const route = {
	path: "/bannerItem",
	categories: ["anime"],
	example: "/hpoi/bannerItem",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.hpoi.net/bannerItem/list"] }],
	name: "热门推荐",
	maintainers: ["DIYgod"],
	handler,
	url: "www.hpoi.net/bannerItem/list"
};
async function handler() {
	const link = "https://www.hpoi.net/bannerItem/list?categoryId=0&bannerItemType=0&subType=0&page=1";
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	return {
		title: "Hpoi 手办维基 - 热门推荐",
		link,
		item: (await Promise.all($("#content .item").toArray().map(async (_item) => {
			const $item = $(_item);
			const link = new URL($item.find("a").attr("href") ?? "", "https://www.hpoi.net").href;
			if (!link.startsWith("https://www.hpoi.net")) return;
			return await cache_default.tryGet(link, async () => {
				const $$ = load((await got_default(link)).data);
				$$(".hpoi-album-content .album-ibox").remove();
				$$(".hpoi-album-content .row").remove();
				$$(".hpoi-album-content .hpoi-hr-line").remove();
				return {
					title: $item.find(".title").text(),
					link,
					description: $$(".hpoi-album-content").html() || `<img src="${$item.find("img").attr("src")}">`,
					pubDate: new Date($item.find(".time").text().replace("发布时间：", "")).toUTCString()
				};
			});
		}))).filter((item) => !!item)
	};
}
//#endregion
export { route };
