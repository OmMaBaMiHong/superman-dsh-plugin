import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/shu/global.ts
const noticeType = {
	tzgg: {
		title: "上海大学国际部港澳台-通知公告",
		url: "https://global.shu.edu.cn/cd/tzgg.htm"
	},
	xwsd: {
		title: "上海大学国际部港澳台-新闻速递",
		url: "https://global.shu.edu.cn/cd/xwsd.htm"
	}
};
const route = {
	path: "/global/:type?",
	categories: ["university"],
	example: "/shu/global/tzgg",
	parameters: { type: "分类，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["global.shu.edu.cn/cd/tzgg.htm", "global.shu.edu.cn/cd/xwsd.htm"],
		target: "/global"
	}],
	name: "国际部港澳台办公室",
	maintainers: ["GhhG123"],
	handler,
	url: "global.shu.edu.cn/",
	description: `| 通知公告 | 新闻速递 |
| -------- | -------- |
| tzgg     | xwsd     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const rootUrl = "https://global.shu.edu.cn";
	const $ = load((await got_default({
		method: "get",
		url: noticeType[type].url
	})).data);
	const list = $("div.only-list1 ul li").toArray().map((el) => {
		const item = $(el);
		const rawLink = item.find("a").attr("href");
		const pubDate = item.find("span").text().trim();
		return {
			title: item.find("a").text().trim(),
			link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl,
			pubDate: timezone(parseDate(pubDate, "YYYY年MM月DD日"), 8),
			description: ""
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)("#vsb_content_2 .v_news_content").html() || "内容无法提取";
		return item;
	})));
	return {
		title: noticeType[type].title,
		description: noticeType[type].title,
		link: noticeType[type].url,
		image: "https://www.shu.edu.cn/__local/0/08/C6/1EABE492B0CF228A5564D6E6ABE_779D1EE3_5BF7.png",
		item: items
	};
}
//#endregion
export { route };
