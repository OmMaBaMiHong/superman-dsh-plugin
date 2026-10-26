import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zuel/notice.ts
const route = {
	path: "/notice",
	categories: ["university"],
	example: "/zuel/notice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wap.zuel.edu.cn/", "wap.zuel.edu.cn/notice/list.htm"] }],
	name: "通知公告",
	maintainers: ["nczitzk"],
	handler,
	url: "wap.zuel.edu.cn/"
};
async function handler() {
	const rootUrl = "http://wap.zuel.edu.cn";
	const currentUrl = `${rootUrl}/notice/list.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".list_item").toArray().map((item) => {
		item = $(item);
		const a = item.find(".Article_Title a");
		return {
			title: a.text(),
			pubDate: parseDate(item.find(".Article_PublishDate").text()),
			link: `${a.attr("href").startsWith("http") ? "" : rootUrl}${a.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".wp_articlecontent, .psgCont, .infodetail").html();
		return item;
	})));
	return {
		title: "中南财经大学 - 通知公告",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
