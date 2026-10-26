import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/upc/main.ts
const MAP = {
	notice: "tzgg",
	scholar: "xsdt"
};
const HEAD = {
	notice: "通知公告",
	scholar: "学术动态"
};
const route = {
	path: "/main/:type",
	categories: ["university"],
	example: "/upc/main/notice",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "主页",
	maintainers: ["Veagau"],
	handler,
	description: `| 通知公告 | 学术动态 |
| -------- | -------- |
| notice   | scholar  |`
};
async function handler(ctx) {
	const baseUrl = "https://news.upc.edu.cn";
	const type = ctx.req.param("type");
	const link = `${baseUrl}/${MAP[type]}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const list = $(".main-list-box-left li").toArray().map((item) => {
		item = $(item);
		const a = item.find(".li-right-bt a");
		const link = a.attr("href");
		return {
			title: a.text(),
			description: item.find(".li-right-zy a").text(),
			link: link.startsWith("http") ? link : `${baseUrl}/${link}`,
			pubDate: parseDate(item.find(".li-left").text(), "DDYYYY-MM")
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (!item.link.startsWith(`${baseUrl}/`) || item.link.includes("content.jsp")) return item;
		const $ = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = $(".v_news_content").html();
		item.pubDate = timezone(parseDate($(".nr-xinxi i").first().text(), "YYYY-MM-DD HH:mm:ss"), 8);
		return item;
	})));
	return {
		title: HEAD[type] + "-中国石油大学（华东）",
		link,
		description: HEAD[type] + "-中国石油大学（华东）",
		item: out
	};
}
//#endregion
export { route };
