import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/shu/index.ts
const noticeType = {
	tzgg: {
		title: "上海大学 - 通知公告",
		url: "https://www.shu.edu.cn/tzgg.htm"
	},
	zyxw: {
		title: "上海大学 - 重要新闻",
		url: "https://www.shu.edu.cn/zyxw.htm"
	}
};
const route = {
	path: "/news/:type?",
	categories: ["university"],
	example: "/shu/news/tzgg",
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
		source: ["www.shu.edu.cn/"],
		target: "/news"
	}],
	name: "官网通知公告",
	maintainers: ["lonelyion", "GhhG123"],
	handler,
	url: "www.shu.edu.cn/",
	description: `| 通知公告 | 重要新闻 |
| -------- | -------- |
| tzgg     | zyxw     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "tzgg";
	const rootUrl = "https://www.shu.edu.cn";
	const $ = load((await got_default({
		method: "get",
		url: noticeType[type].url
	})).data);
	const list = $("div.list ul li").toArray().map((el) => {
		const item = $(el);
		const rawLink = item.find("a").attr("href");
		return {
			title: item.find("p.bt").text().trim(),
			link: rawLink ? new URL(rawLink, rootUrl).href : rootUrl,
			pubDate: timezone(parseDate(item.find("p.sj").text().trim(), "YYYY.MM.DD"), 8),
			description: item.find("p.zy").text().trim()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)("#vsb_content .v_news_content").html() || item.description;
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
