import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/asianfanfics/text-search.ts
const route = {
	path: "/text-search/:keyword",
	categories: ["reading"],
	example: "/asianfanfics/text-search/milklove",
	parameters: { keyword: "关键词" },
	name: "关键词",
	maintainers: ["KazooTTT"],
	radar: [{
		source: ["www.asianfanfics.com/browse/text_search?q=:keyword"],
		target: "/text-search/:keyword"
	}],
	description: "匹配 asianfanfics 搜索关键词",
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	if (keyword.trim() === "") throw new Error("关键词不能为空");
	const link = `https://www.asianfanfics.com/browse/text_search?q=${keyword}+`;
	const $ = load(await rofetch(link, { headers: { "user-agent": config.trueUA } }));
	const items = $(".primary-container .excerpt").toArray().filter((element) => {
		return $(element).find(".excerpt__title a").length > 0;
	}).map((element) => {
		const $element = $(element);
		return {
			title: $element.find(".excerpt__title a").text(),
			link: "https://www.asianfanfics.com" + $element.find(".excerpt__title a").attr("href"),
			author: $element.find(".excerpt__meta__name a").text().trim(),
			pubDate: parseDate($element.find("time").attr("datetime") || ""),
			description: $element.find(".excerpt__text").html()
		};
	});
	return {
		title: `Asianfanfics - 关键词：${keyword}`,
		link,
		item: items
	};
}
//#endregion
export { route };
