import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wchscu/recruit.ts
const handler = async () => {
	const rootUrl = "https:///www.wchscu.cn";
	const currentUrl = "https://www.wchscu.cn/public/notice/recruit";
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const list = $("div#datalist div.list div.item").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("span.s1").text(),
			pubDate: parseDate(item.find("span.s2").text()),
			link: new URL(item.find("a").prop("href"), rootUrl).href
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)("div.xxy3 .content").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
};
const route = {
	name: "招聘公告",
	path: "/recruit",
	example: "/wchscu/recruit",
	url: "www.wchscu.cn",
	maintainers: ["ViggoC"],
	categories: ["other"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.wchscu.cn/public/notice/recruit"] }],
	handler
};
//#endregion
export { route };
