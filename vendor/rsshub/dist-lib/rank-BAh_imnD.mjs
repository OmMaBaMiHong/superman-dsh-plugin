import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qianzhan/rank.ts
const route = {
	path: "/analyst/rank/:type?",
	categories: ["finance"],
	example: "/qianzhan/analyst/rank/week",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["qianzhan.com/analyst", "qianzhan.com/"],
		target: "/analyst/rank"
	}],
	name: "排行榜",
	maintainers: ["moke8"],
	handler,
	url: "qianzhan.com/analyst",
	description: `| 周排行 | 月排行 |
| ------ | ------ |
| week   | month  |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") === "week" ? 1 : 2;
	const rootUrl = "https://www.qianzhan.com/analyst/";
	const $ = load((await got_default(rootUrl)).data);
	const links = $(`#div_hotlist ul[idx='${type}'] a`).map((_, item) => $(item).attr("href"));
	const items = await Promise.all(links.map((_, item) => cache_default.tryGet(item, async () => {
		const $ = load((await got_default(item)).data);
		const description = $("#divArtBody").html();
		return {
			title: $("#h_title").text(),
			link: item,
			description,
			pubDate: timezone(parseDate($("#pubtime_baidu").text().split("• ", 2)[1], "YYYY-MM-DD HH:mm:ss"), 8),
			author: $(".bljjxue").text().match(/\S+/)[0],
			category: $("meta[name=\"Keywords\"]").attr("content").split(",")
		};
	})));
	return {
		title: `前瞻经济学人 - ${type === 1 ? "周排行" : "月排行"}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
