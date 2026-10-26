import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/mhlw/monthly-labour-survey.ts
const route = {
	path: "/monthly-labour-survey",
	categories: ["government"],
	example: "/mhlw/monthly-labour-survey",
	radar: [{ source: ["www.mhlw.go.jp/toukei/list/30-1a.html"] }],
	name: "毎月勤労統計調査 全国調査（月別結果）",
	maintainers: ["TonyRL"],
	handler,
	url: "www.mhlw.go.jp/toukei/list/30-1a.html"
};
async function fetchPage(url) {
	const raw = await rofetch(url, { responseType: "arrayBuffer" });
	return new TextDecoder("shift-jis").decode(raw);
}
async function handler(ctx) {
	const limit = Number(ctx.req.query("limit") || "24");
	const baseUrl = "https://www.mhlw.go.jp";
	const link = `${baseUrl}/toukei/list/30-1a.html`;
	const $ = load(await fetchPage(link));
	const list = $("table.xgengo:first tr").toArray().flatMap((row) => {
		const $row = $(row);
		const year = $row.find("h3").text().trim();
		return $row.find("ul.ico-link li a").toArray().map((a) => {
			const $a = $(a);
			return {
				title: `${year}${$a.text().trim()}`,
				link: new URL($a.attr("href"), baseUrl).href
			};
		}).toReversed();
	}).slice(0, limit);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await fetchPage(item.link));
		const cleanedDate = $(".prt-topContents .al-right").text().trim().replaceAll(/（[^）]+）/g, "");
		const content = $("#contentsInner");
		content.find(".prt-topContents, .prt-linkNavi, .prt-plugin").remove();
		item.title = $("h1#pageTitle").text().trim() || item.title;
		item.pubDate = timezone(parseDate(cleanedDate, "YYYY年M月D日"), 9);
		item.description = content.html()?.trim();
		return item;
	})));
	return {
		title: $("head title").text().trim(),
		description: $("meta[name=\"description\"]").attr("content")?.trim(),
		link,
		image: `${baseUrl}/favicon.ico`,
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
