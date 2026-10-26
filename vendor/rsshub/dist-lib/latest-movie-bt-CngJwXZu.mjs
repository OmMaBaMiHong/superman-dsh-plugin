import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as ensureDomain } from "./utils-CyCATJ2_.mjs";
import { t as getItemList$1 } from "./detail-DPis3LBc.mjs";
import { load } from "cheerio";
//#region lib/routes/domp4/latest-movie-bt.ts
function getItemList($) {
	return $("#vod .list-group-item").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").text(),
			publishDate: item.find("b").text(),
			link: `https://www.xlmp4.com${item.find("a").attr("href")}`
		};
	}).filter((item) => !item.title.includes("话") && !item.title.includes("集") && !item.title.includes("更新至"));
}
const route = {
	path: "/latest_movie_bt",
	categories: ["multimedia"],
	example: "/domp4/latest_movie_bt",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.xlmp4.com/", "www.xlmp4.com/custom/update.html"] }],
	name: "最近更新的电源BT列表",
	maintainers: ["xianghuawe", "pseudoyu"],
	handler,
	url: "www.xlmp4.com/"
};
async function handler(ctx) {
	const { domain, second } = ctx.req.query();
	const latestUrl = `${ensureDomain(ctx, domain)}/custom/update.html`;
	const list = getItemList(load(await rofetch(latestUrl)));
	return {
		link: latestUrl,
		title: "domp4电影",
		item: (await Promise.all(list.map(async (item) => await cache_default.tryGet(item.link, async () => {
			return getItemList$1(load(await rofetch(item.link)), item.link, second);
		})))).filter((item) => item !== void 0).flat()
	};
}
//#endregion
export { route };
