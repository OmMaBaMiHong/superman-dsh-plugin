import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gelonghui/utils.ts
const parseItem = (item) => cache_default.tryGet(item.link, async () => {
	const { data: res } = await got_default(item.link);
	const $ = load(res);
	if (item.link.startsWith("https://www.gelonghui.com/live/")) {
		item.title = $(".type-name").next().text().trim();
		item.description = $(".dtb-content").html();
	} else {
		item.title = $(".article-title").text().trim();
		item.description = $(".article-summary").html() + $("article.article-with-html").html();
		if (!item.pubDate) item.pubDate = $("time.date").text().includes("前") || $("time.date").text().includes("天") ? parseRelativeDate($("time.date").text()) : timezone(parseDate($("time.date").text(), "MM-DD HH:mm"), 8);
	}
	return item;
});
//#endregion
export { parseItem as t };
