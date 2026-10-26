import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/wechat/ershcimi.ts
const route = {
	path: "/ershicimi/:id",
	categories: ["new-media"],
	example: "/wechat/ershicimi/813oxJOl",
	parameters: { id: "公众号id，打开公众号页，在 URL 中找到 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公众号（二十次幂来源）",
	maintainers: ["sanmmm"],
	handler
};
async function handler(ctx) {
	const url = `https://www.cimidata.com/a/${ctx.req.param("id")}`;
	const $ = load((await got_default(url)).data);
	const items = $(".weui_media_box").toArray().map((ele) => {
		const $item = load(ele);
		const link = $item(".weui_media_title a").attr("href");
		return {
			title: $item(".weui_media_title a").text(),
			description: $item(".weui_media_desc").text(),
			link,
			pubDate: timezone(parseDate($item(".weui_media_extra_info").attr("title")), 8)
		};
	});
	return {
		title: `微信公众号 - ${$("span.name").text()}`,
		link: url,
		description: $("div.Profile-sideColumnItemValue").text(),
		item: await Promise.all(items.map((item) => finishArticleItem(item)))
	};
}
//#endregion
export { route };
