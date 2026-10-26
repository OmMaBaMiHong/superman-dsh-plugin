import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/tw-nongmu/market.ts
const route = {
	path: "/market",
	categories: ["other"],
	example: "/tw-nongmu/market",
	radar: [{ source: ["www.tw-nongmu.com/market.html", "www.tw-nongmu.com/"] }],
	name: "鱼价行情",
	maintainers: ["TonyRL"],
	handler,
	url: "www.tw-nongmu.com/market.html"
};
async function handler() {
	const baseUrl = "https://www.tw-nongmu.com";
	const link = `${baseUrl}/market.html`;
	const $ = load(await rofetch(link));
	const list = $(".list-list li").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("a");
		return {
			title: a.text(),
			link: a.attr("href"),
			pubDate: parseDate($item.find(".date").text(), "YYYY年MM月DD日")
		};
	});
	const items = await Promise.all(list.map((item) => finishArticleItem(item)));
	return {
		title: $("head title").text(),
		link,
		language: $("html").attr("lang"),
		image: `${baseUrl}/favicon.ico`,
		item: items
	};
}
//#endregion
export { route };
