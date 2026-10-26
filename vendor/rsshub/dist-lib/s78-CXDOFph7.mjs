import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/moe/s78.ts
const route = {
	path: "/s78/:column",
	categories: ["government"],
	example: "/gov/moe/s78/A13",
	parameters: { column: "司局 ID，可在 URL 找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["moe.gov.cn/s78/:column/tongzhi", "moe.gov.cn/s78/:column"] }],
	name: "司局通知",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const link = `https://www.moe.gov.cn/s78/${ctx.req.param("column")}/tongzhi/`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $("#list li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: new URL(item.find("a").attr("href"), link).href,
			pubDate: timezone(parseDate(item.find("span").text(), "YYYY-MM-DD"), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		$("#moe-detail-page-set, #moeCode, .moe-detail-shuxing, h1").remove();
		item.description = $(".moe-detail-box").html();
		return item;
	})));
	return {
		title: `${$("meta[name=\"ColumnType\"]").attr("content")} - ${$("head title").text()}`,
		link,
		item: items
	};
}
//#endregion
export { route };
