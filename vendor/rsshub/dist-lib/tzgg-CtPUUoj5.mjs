import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/beijing/jw/tzgg.ts
const route = {
	path: "/jw/tzgg",
	categories: ["government"],
	example: "/gov/beijing/jw/tzgg",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jw.beijing.gov.cn/tzgg"] }],
	name: "通知公告",
	maintainers: ["nczitzk"],
	handler,
	url: "jw.beijing.gov.cn/tzgg"
};
async function handler() {
	const rootUrl = "http://jw.beijing.gov.cn";
	const currentUrl = `${rootUrl}/tzgg`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".col-md a").toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return {
			title: item.text(),
			link: link.startsWith("http") ? link : `${rootUrl}${link.replace(/^\./, "/tzgg")}`,
			pubDate: parseDate(item.parent().find("span").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const pubDate = content("meta[name=\"PubDate\"]").attr("content");
		item.author = content("meta[name=\"ContentSource\"]").attr("content");
		item.pubDate = pubDate ? timezone(parseDate(content("meta[name=\"PubDate\"]").attr("content")), 8) : item.pubDate;
		item.description = content(".TRS_UEDITOR").html();
		return item;
	})));
	return {
		title: "北京市教育委员会 - 通知公告",
		link: currentUrl,
		item: items,
		description: $("meta[name=\"ColumnDescription\"]").attr("content")
	};
}
//#endregion
export { route };
