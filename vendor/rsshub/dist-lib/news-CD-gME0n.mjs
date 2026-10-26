import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cefco/news.ts
const route = {
	path: "/research/news",
	categories: ["other"],
	example: "/cefco/research/news",
	radar: [{ source: ["www.cefco.cn/research/news.html"] }],
	name: "观点",
	maintainers: ["TonyRL"],
	handler,
	url: "www.cefco.cn/research/news.html"
};
async function handler() {
	const baseUrl = "https://www.cefco.cn";
	const link = `${baseUrl}/research/news.html`;
	const $ = load(await rofetch(link));
	const list = $("#ajaxList li.fixed").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("dt a");
		return {
			title: a.text().trim(),
			link: new URL(a.attr("href"), baseUrl).href,
			description: $item.find("dd.clamp").text(),
			pubDate: timezone(parseDate($item.find("dd.time").text().trim(), "YYYY/MM/DD"), 8),
			image: $item.find("a.imgbox img").attr("src") ? new URL($item.find("a.imgbox img").attr("src"), baseUrl).href : void 0
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load(await rofetch(item.link))(".edit_con_original").html() ?? item.description;
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		language: "zh-CN",
		image: `${baseUrl}/images/favicon.ico`,
		item: items
	};
}
//#endregion
export { route };
