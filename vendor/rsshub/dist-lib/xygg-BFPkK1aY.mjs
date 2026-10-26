import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scvtc/xygg.ts
const route = {
	path: "/xygg",
	categories: ["university"],
	example: "/scvtc/xygg",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["scvtc.edu.cn/ggfw1/xygg.htm", "scvtc.edu.cn/"] }],
	name: "学院公告",
	maintainers: ["nczitzk"],
	handler,
	url: "scvtc.edu.cn/ggfw1/xygg.htm"
};
async function handler() {
	const currentUrl = "https://www.scvtc.edu.cn/ggfw1/xygg.htm";
	const $ = load((await got_default(currentUrl)).data);
	const list = $("div.text-list ul li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a[title]");
		return {
			title: a.attr("title"),
			link: new URL(a.attr("href"), currentUrl).href,
			pubDate: parseDate(item.find("span").text().trim())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("#vsb_content").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		decription: $("meta[name=description]").attr("content"),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
