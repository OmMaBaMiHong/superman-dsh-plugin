import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hongkong/dh.ts
const route = {
	path: "/dh/:language?",
	categories: ["government"],
	example: "/hongkong/dh",
	parameters: { language: "Language, see below, tc_chi by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dh.gov.hk/"] }],
	name: "Press Release",
	maintainers: ["nczitzk"],
	handler,
	url: "dh.gov.hk/",
	description: `Language

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| english | chs      | tc\\_chi  |`
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "tc_chi";
	const rootUrl = "https://www.dh.gov.hk";
	const currentUrl = `${rootUrl}/${language}/press/press.html`;
	const $ = load((await got_default({
		method: "get",
		url: `${rootUrl}/textonly/${language}/press/press.html`
	})).data);
	let items = $("td[headers=\"title\"]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.find("a").attr("href"),
			pubDate: parseDate(item.next().text(), language === "english" ? "D-MMMM-YYYY" : "YYYY年M月D日")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)("#pressrelease").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
