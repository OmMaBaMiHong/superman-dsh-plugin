import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/taoguba/util.ts
const rootUrl = "https://www.tgb.cn";
const renderPostDetail = async (item) => await cache_default.tryGet(item.link, async () => {
	const detailResponse = await got_default({
		method: "get",
		url: item.link
	});
	const content = load(detailResponse.data);
	content("#videoImg").remove();
	content("img").each((_, img) => {
		if (!img.attribs.src2) return;
		img.attribs.src = img.attribs.src2;
		delete img.attribs.src2;
		delete img.attribs["data-original"];
	});
	item.description = content("#first").html();
	if (detailResponse.url?.startsWith("https://www.tgb.cn/topic/transfer") || content(".login-view-button").length !== 0) item.description += "<br>登录后可查看完整文章";
	item.pubDate = timezone(parseDate(content(".article-data > span:nth-child(2)").text().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)[0]), 8);
	item.category = content(".classify").toArray().map((item) => content(item).text().trim());
	return item;
});
//#endregion
export { rootUrl as n, renderPostDetail as t };
