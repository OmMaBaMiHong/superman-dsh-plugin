import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/aisixiang/utils.ts
const ossUrl = "https://oss.aisixiang.com";
const rootUrl = "https://www.aisixiang.com";
const ProcessFeed = (limit, items) => Promise.all(items.slice(0, limit).map((item) => cache_default.tryGet(item.link, async () => {
	const { data: detailResponse } = await got_default(item.link);
	const content = load(detailResponse);
	const commentMatches = content("h3.comment-header").text().match(/评论（\d+）/);
	item.title = content("h3").first().text().split("：").pop();
	item.description = content("div.article-content").html();
	item.author = content("div.about strong").first().text();
	item.category = content("u").first().parent().find("u").toArray().map((c) => content(c).text());
	item.pubDate = timezone(parseDate(content("div.info").text().split("时间：").pop()), 8);
	item.upvotes = content("span.like-num").text() ? Number(content("span.like-num").text()) : 0;
	item.comments = commentMatches ? Number(commentMatches[1]) : 0;
	return item;
})));
//#endregion
export { ossUrl as n, rootUrl as r, ProcessFeed as t };
