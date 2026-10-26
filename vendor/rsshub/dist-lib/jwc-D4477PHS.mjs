import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ustc/jwc.ts
const noticeUrl = "https://www.teach.ustc.edu.cn/category/notice";
const noticeType = {
	teaching: "教学",
	info: "信息",
	exam: "考试",
	exchange: "交流"
};
const route = {
	path: "/jwc/:type?",
	categories: ["university"],
	example: "/ustc/jwc/info",
	parameters: { type: "分类，默认显示所有种类" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.teach.ustc.edu.cn/"],
		target: "/jwc"
	}],
	name: "教务处通知新闻",
	maintainers: ["hang333"],
	handler,
	url: "www.teach.ustc.edu.cn/",
	description: `| 信息 | 教学     | 考试 | 交流     |
| ---- | -------- | ---- | -------- |
| info | teaching | exam | exchange |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "";
	const $ = load((await got_default({
		method: "get",
		url: `${noticeUrl}${type === "" ? "" : "-" + type}`
	})).data);
	let items = $(type === "" ? "ul[class=\"article-list with-tag\"] > li" : "ul[class=article-list] > li").toArray().map((element) => {
		const child = $(element).children();
		return {
			title: type === "" ? $(child[0]).find("a").text() + " - " + $(child[1]).find("a").text() : $(child[0]).find("a").text(),
			link: type === "" ? $(child[1]).find("a").attr("href") : $(child[0]).find("a").attr("href"),
			pubDate: timezone(parseDate($(element).find(".date").text().trim(), "YYYY-MM-DD"), 8)
		};
	});
	items = await Promise.all(items.filter((item) => item.link).map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.description = $("main[class=single]").html() ?? $(".card-footer").html() ?? $(".v_news_content").html();
		item.pubDate = $("li[class=meta-date]").text() ? timezone(parseDate($("li[class=meta-date]").text(), "YYYY-MM-DD HH:mm"), 8) : item.pubDate;
		return item;
	})));
	const desc = type === "" ? "中国科学技术大学教务处 - 通知新闻" : `中国科学技术大学教务处 - ${noticeType[type]}类通知`;
	return {
		title: desc,
		description: desc,
		link: `${noticeUrl}${type === "" ? "" : "-" + type}`,
		item: items
	};
}
//#endregion
export { route };
