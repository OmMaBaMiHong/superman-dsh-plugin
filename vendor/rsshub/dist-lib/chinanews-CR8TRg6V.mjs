import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/chinanews/index.ts
const rootUrl = "https://www.chinanews.com.cn";
const route = {
	path: "/",
	radar: [{
		source: ["chinanews.com.cn/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["yuxinliu-alex"],
	handler,
	url: "chinanews.com.cn/"
};
async function handler(ctx) {
	const currentUrl = `${rootUrl}/scroll-news/news1.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const limit = ctx.req.query("limit");
	const list = $("a", ".dd_bt").toArray().map((item) => ({
		link: rootUrl + $(item).attr("href"),
		title: $(item).text()
	})).slice(0, limit ? Number.parseInt(limit) : 50);
	return {
		title: "中国新闻网",
		link: currentUrl,
		description: "中国新闻网（简称“中新网”），由中国新闻社主办，为中央重点新闻网站。",
		language: "zh-cn",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			content(".adInContent").remove();
			if (content("div.content_desc").length > 0) {
				item.description = content("div.content_desc").html();
				item.author = content("a.source").text();
				const info = content("p", ".left").text().trim().slice(5).split(" ");
				item.author = info[2].trim();
				item.pubDate = timezone(parseDate(info[0] + info[1], "YYYY年MM月DD日HH:mm"), 8);
			} else if (content("div.t3").length > 0) {
				item.description = content("div.t3").html();
				const info = content("div[style=\"text-align:right;font-size:12px;\"]").text().slice(5).split(" ");
				item.author = info[2];
				item.pubDate = timezone(parseDate(info[0] + info[1], "YYYY-MM-DDHH:mm"), 8);
			} else {
				item.description = content("div.left_zw").html();
				const info = content("div.left-t").contents().filter((_, el) => el.type === "text").text().split("　");
				item.pubDate = timezone(parseDate(info[0], "YYYY年MM月DD日 HH:mm"), 8);
				item.author = info[1] + content("a.source").text();
			}
			return item;
		})))
	};
}
//#endregion
export { route };
