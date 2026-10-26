import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/trendforce/news-cn.ts
const route = {
	path: "/cn/presscenter/news",
	categories: ["new-media"],
	example: "/trendforce/cn/presscenter/news",
	radar: [{ source: ["www.trendforce.cn/presscenter/news"] }],
	name: "产业洞察",
	maintainers: ["TonyRL"],
	handler,
	url: "www.trendforce.cn/presscenter/news"
};
async function handler() {
	const baseUrl = "https://www.trendforce.cn";
	const link = `${baseUrl}/presscenter/news`;
	const $ = load(await rofetch(link));
	const list = $(".list-items .list-item").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("h3 a.title-link");
		return {
			title: a.find("strong").text().trim(),
			link: new URL(a.attr("href"), baseUrl).href,
			description: $item.find("p").text()?.trim(),
			pubDate: parseDate($item.find("h4").text().trim())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		const pressCenter = $(".presscenter");
		const tagRow = pressCenter.find(".tag-row");
		item.category = tagRow.find(".fa-bookmark").parent().find("a").toArray().map((a) => $(a).text().trim());
		item.author = tagRow.find(".fa-user").parent().find("a").text().trim();
		pressCenter.find("h1, .tag-row, .press-choose-post, hr").remove();
		item.description = pressCenter.html()?.trim();
		return item;
	})));
	return {
		title: $("head title").text().trim(),
		description: $("meta[name=\"description\"]").attr("content"),
		link,
		language: $("html").attr("lang"),
		image: `${baseUrl}${$("link[rel=\"apple-touch-icon-precomposed\"][sizes=\"152x152\"]").attr("href")}`,
		item: items
	};
}
//#endregion
export { route };
