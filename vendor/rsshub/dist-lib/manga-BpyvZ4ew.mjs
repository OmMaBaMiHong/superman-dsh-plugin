import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/bakamh/manga.ts
const url = "https://bakamh.com";
const handler = async (ctx) => {
	const { name } = ctx.req.param();
	const limit = Number.parseInt(ctx.req.query("limit"), 15) || 15;
	const link = `${url}/manga/${name}/`;
	const $ = load(await rofetch(link));
	const ldJson = JSON.parse($("script[type=\"application/ld+json\"]").text());
	const list = $("li.wp-manga-chapter").toArray().slice(0, limit).map((item) => {
		const $item = $(item);
		const itemDate = $item.find("i").text().replaceAll(" ", "");
		return {
			title: $item.find("a").text(),
			link: $item.find("a").attr("href"),
			guid: $item.find("a").attr("href"),
			pubDate: itemDate
		};
	});
	if (list.length > 0) list[0].pubDate = ldJson.dateModified;
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		const comicpage = $("div.reading-content img");
		const containerDiv = $("<div class=\"image-container\"></div>");
		comicpage.appendTo(containerDiv);
		item.description = containerDiv.html();
		item.pubDate = parseDate(item.pubDate, "YYYY年M月D日");
		return item;
	})));
	return {
		title: $("title").text(),
		link,
		description: $(".post-content_item p").text(),
		image: $(".summary_image a img").attr("src"),
		item: items
	};
};
const route = {
	path: "/manga/:name",
	categories: ["anime"],
	example: "/bakamh/manga/最强家丁",
	parameters: { name: "漫画名称，漫画主页的地址栏中" },
	radar: [{ source: ["bakamh.com/manga/:name/"] }],
	name: "漫画更新",
	maintainers: ["yoyobase"],
	handler,
	url: "bakamh.com"
};
//#endregion
export { route };
