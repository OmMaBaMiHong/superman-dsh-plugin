import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/chongqing/rsks.ts
const rsksUrl = "https://rlsbj.cq.gov.cn/ywzl/rsks/tzgg_109374/";
const route = {
	path: "/rsks",
	categories: ["government"],
	example: "/gov/chongqing/rsks",
	radar: [{ source: ["rlsbj.cq.gov.cn/"] }],
	name: "人力社保局 - 人事考试通知",
	maintainers: ["Mai19930513"],
	handler,
	url: "rlsbj.cq.gov.cn/"
};
async function handler() {
	const { data: response } = await got_default(rsksUrl);
	const $ = load(response);
	const list = $("div.page-list .tab-item > li").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").first();
		return {
			title: title.text(),
			link: `${rsksUrl}${title.attr("href")}`,
			pubDate: parseDate(item.find("span").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.pubDate = parseDate($("meta[name=\"PubDate\"]").attr("content")) ?? item.pubDate;
		item.description = $(".view.TRS_UEDITOR.trs_paper_default.trs_word").first().html();
		return item;
	})));
	return {
		title: "重庆人事考试通知公告",
		link: rsksUrl,
		item: items
	};
}
//#endregion
export { route };
