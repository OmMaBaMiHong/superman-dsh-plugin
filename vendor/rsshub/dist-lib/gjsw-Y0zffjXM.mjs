import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/gjsw.ts
const host = "https://www.ipo.sdu.edu.cn/";
const typeMap = { tzgg: {
	title: "通知公告",
	url: "tzgg.htm"
} };
const route = {
	path: "/gjsw/:type?",
	categories: ["university"],
	example: "/sdu/gjsw/tzgg",
	parameters: { type: "默认为`tzgg`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "国际事务部",
	maintainers: ["kukeya"],
	handler,
	description: `| 通知公告 |
| -------- |
| tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const link = new URL(typeMap[type].url, host).href;
	const $ = load((await got_default(link)).data);
	let item = $(".dqlb ul li").toArray().map((e) => {
		e = $(e);
		const a = e.find("a");
		return {
			title: a.text().trim(),
			link: a.attr("href").startsWith("wdhcontent") ? host + a.attr("href") : a.attr("href"),
			pubDate: parseDate(e.find(".fr").text().trim(), "YYYY-MM-DD")
		};
	});
	item = await Promise.all(item.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).hostname === "mp.weixin.qq.com") return finishArticleItem(item);
		item.description = load((await got_default(item.link)).data)(".v_news_content").html();
		return item;
	})));
	return {
		title: `山东大学国际事务部${typeMap[type].title}`,
		description: $("title").text(),
		link,
		item
	};
}
//#endregion
export { route };
