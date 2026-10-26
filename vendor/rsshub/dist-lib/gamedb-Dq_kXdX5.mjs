import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/indienova/gamedb.ts
const route = {
	path: "/gamedb/recent",
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { platform = "all" } = ctx.req.param();
	const baseUrl = "https://indienova.com";
	const { data: response, url: link } = await got_default(`${baseUrl}/gamedb/recent/${platform}/p/1`);
	const $ = load(response);
	const list = $(".related-game").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("span").contents().filter((_, el) => el.nodeType === 3).text(),
			link: new URL(item.find("a").attr("href"), baseUrl).href
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		const featureBox = $(".feature-box");
		if (featureBox.length) {
			item.description = featureBox.find("p").first().text();
			return item;
		}
		const article = $(".row article");
		article.find("#showHiddenText").remove();
		item.description = $(".cover-image").prop("outerHTML") + $(".tab-container").html() + article.html();
		item.pubDate = $(".gamedb-release").length ? timezone(parseDate($(".gamedb-release").text().replaceAll(/[()]/g, "")), 8) : null;
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };
