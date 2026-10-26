import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/mohw/clarification.ts
const route = {
	path: "/clarification",
	categories: ["government"],
	example: "/mohw/clarification",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["mohw.gov.tw/"] }],
	name: "即時新聞澄清",
	maintainers: ["nczitzk"],
	handler,
	url: "mohw.gov.tw/"
};
async function handler() {
	const currentUrl = `https://www.mohw.gov.tw/lp-17-1.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".list01 a[title]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content("article").html();
		item.pubDate = parseDate(content("meta[name=\"DC.Date\"]").attr("datetime"));
		return item;
	})));
	return {
		title: "即時新聞澄清 - 台灣衛生福利部",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
