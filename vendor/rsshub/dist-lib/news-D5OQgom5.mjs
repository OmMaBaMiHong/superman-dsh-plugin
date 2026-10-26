import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/keepass/news.ts
const route = {
	path: "/",
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://keepass.info/news/news_all.html";
	const { data: response } = await got_default(baseUrl);
	const $ = load(response);
	const list = $("p > a").toArray().map((elem) => {
		elem = $(elem);
		return {
			title: elem.find("b").text(),
			link: new URL(elem.attr("href"), baseUrl).href,
			pubDate: parseDate(elem.next().next("small").text().split(".", 1)[0])
		};
	}).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (!item.link.startsWith("https://keepass.info/")) return item;
		const { data } = await got_default(item.link);
		const $ = load(data);
		$(".sectionheader").remove();
		$(".laytablews > tbody> tr:nth-child(1) > td:nth-child(2) > p").first().remove();
		item.description = $(".laytablews > tbody> tr:nth-child(1) > td:nth-child(2)").html();
		return item;
	})));
	return {
		title: $("head title").attr("content"),
		link: baseUrl,
		item: items
	};
}
//#endregion
export { route };
