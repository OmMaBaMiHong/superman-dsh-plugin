import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bad/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://bad.news${getSubPath(ctx) === "/" ? "" : getSubPath(ctx)}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".option, .pagination").remove();
	const items = $(".entry").toArray().map((item) => {
		item = $(item);
		const a = item.find("a.title");
		item.find("img").each((_, el) => {
			$(el).attr("src", $(el).attr("data-echo"));
			$(el).removeClass("lazy");
			$(el).removeAttr("data-echo");
			$(el).removeAttr("id");
		});
		item.find("video").each((_, el) => {
			$(el).attr("poster", $(el).attr("data-echo"));
			$(el).removeAttr("data-echo");
			$(el).removeAttr("onerror");
			$(el).removeAttr("id");
		});
		return {
			title: a.text(),
			link: a.attr("href"),
			description: item.find(".coverdiv").html(),
			author: item.find(".author").text().trim(),
			pubDate: timezone(parseDate(item.find("time").attr("datetime")), 8),
			category: item.find(".label").toArray().map((l) => $(l).text().trim())
		};
	});
	return {
		title: `Bad.news - ${$(".active").text()}${$(".selected").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
