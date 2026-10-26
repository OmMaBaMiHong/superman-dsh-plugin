import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/wuhan/whyw.ts
const route = {
	path: "/sy/whyw",
	categories: ["government"],
	example: "/gov/wuhan/sy/whyw",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"wuhan.gov.cn/sy/whyw/",
		"wuhan.gov.cn/whyw",
		"wuhan.gov.cn/"
	] }],
	name: "要闻",
	maintainers: ["nczitzk"],
	handler,
	url: "wuhan.gov.cn/sy/whyw/"
};
async function handler() {
	const currentUrl = `http://www.wuhan.gov.cn/sy/whyw/`;
	const $ = load((await got_default(currentUrl)).data);
	const list = $(".articleList li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: new URL(a.attr("href"), currentUrl).href,
			pubDate: timezone(parseDate(item.find(".time").text()), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		item.description = content(".view").html();
		item.author = content("meta[name=ContentSource]").attr("content");
		return item;
	})));
	return {
		title: `${$("h2").text()} - 武汉市人民政府`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
