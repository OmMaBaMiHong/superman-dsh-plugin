import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/mofcom/article.ts
const host = "http://www.mofcom.gov.cn";
const route = {
	path: "/article/:suffix{.+}",
	name: "政务公开",
	example: "/gov/mofcom/article/b",
	parameters: { suffix: "支持形如 `http://www.mofcom.gov.cn/article/*` 的网站，传入 article 之后的后缀" },
	maintainers: ["LogicJake"],
	handler
};
async function handler(ctx) {
	const url = `http://www.mofcom.gov.cn/article/${ctx.req.param("suffix")}/`;
	const { data: res } = await got_default(url);
	const $ = load(res);
	$(".listline").remove();
	const list = $(".txtList_01 li").toArray().map((item) => {
		item = $(item);
		const date = item.find("span").length === 0 ? item.find("a").attr("title").match(/(\d{4}年\d{1,2}月\d{1,2})/)[1] : item.find("span").text().match(/((\d{4}-\d{2}-\d{2})(\s\d{2}:\d{2}:\d{2})?)/)[1];
		return {
			title: item.find("a").attr("title"),
			link: host + item.find("a").attr("href"),
			pubDate: timezone(parseDate(date, [
				"YYYY-MM-DD HH:mm:ss",
				"YYYY-MM-DD",
				"YYYY年M月D"
			]), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		let responses = await got_default(item.link);
		const redirect = responses.data.match(/_cofing1=\{href:"(.*)",type/) || responses.data.match(/window\.location\.href='(.*)'/);
		if (redirect) responses = await got_default(redirect[1], { headers: { Referer: item.link } });
		const $ = load(responses.data);
		const iframe = $(".art-con iframe").attr("src");
		if ($(".art-con iframe").attr("src")) {
			const { data: res } = await got_default(iframe);
			item.description = load(res)("tbody").html();
		} else item.description = $(".art-con").html() || $(".textlive").html();
		item.pubDate = $("meta[name=\"PubDate\"]").length ? timezone(parseDate($("meta[name=\"PubDate\"]").attr("content"), "YYYY-MM-DD HH:mm"), 8) : item.pubDate;
		return item;
	})));
	return {
		title: $("head > title").text(),
		description: $("meta[name=description]").attr("content"),
		link: url,
		item: items
	};
}
//#endregion
export { route };
