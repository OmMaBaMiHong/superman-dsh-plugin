import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as fetchArticle } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/nua/utils.ts
const pageType = (href) => {
	if (!href.startsWith("http")) return "in-nua";
	const url = new URL(href);
	if (url.hostname === "mp.weixin.qq.com") return "wechat-mp";
	if (url.hostname === "www.nua.edu.cn") return "nua";
	return "unknown";
};
function arti_link(text, href) {
	return `<a href="${href}">${text}</a>`;
}
async function ProcessList(newsUrl, baseUrl, listName, listDate, webPageName) {
	const $ = load((await got_default(newsUrl)).data);
	const pageName = $(webPageName).text().trim();
	return [$(listName).toArray().map((item) => {
		const href = $(item).find("a").attr("href");
		const type = pageType(href);
		return {
			link: type === "in-nua" ? baseUrl + href : href,
			title: $(item).find("a").attr("title"),
			pubDate: timezone(parseDate($(item).find(listDate).first().text(), "YYYY-MM-DD"), 8),
			type
		};
	}), pageName];
}
const ProcessFeed = (items, artiContent) => Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
	switch (item.type) {
		case "in-nua":
		case "nua": {
			const $ = load((await got_default(item.link)).data);
			item.author = $(".arti_publisher").text() + "  " + $(".arti_views").text();
			item.description = $(artiContent).html();
			return item;
		}
		case "wechat-mp": return fetchArticle(item.link);
		default:
			item.description = `暂不支持解析该内容，请点击 ${arti_link("原文", item.link)}`;
			return item;
	}
})));
var utils_default = {
	ProcessList,
	ProcessFeed
};
//#endregion
export { utils_default as t };
