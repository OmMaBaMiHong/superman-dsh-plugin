import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { r as ensureDomain } from "./utils-CyCATJ2_.mjs";
import { load } from "cheerio";
//#region lib/routes/domp4/latest.ts
function getItemList($, type) {
	return $(`#${type} .list-group-item`).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").text(),
			link: `https://www.xlmp4.com${item.find("a").attr("href")}`
		};
	});
}
const route = {
	path: "/latest/:type?",
	categories: ["multimedia"],
	example: "/domp4/latest/vod",
	parameters: { type: "`vod` 代表电影，`tv` 代表电视剧，默认 vod" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.xlmp4.com/", "www.xlmp4.com/custom/update.html"] }],
	name: "最近更新",
	maintainers: ["savokiss", "pseudoyu"],
	handler,
	url: "www.xlmp4.com/"
};
async function handler(ctx) {
	const { type = "vod" } = ctx.req.param();
	const { domain } = ctx.req.query();
	const latestUrl = `${ensureDomain(ctx, domain)}/custom/update.html`;
	return {
		link: latestUrl,
		title: "domp4电影",
		item: getItemList(load(await rofetch(latestUrl)), type)
	};
}
//#endregion
export { route };
