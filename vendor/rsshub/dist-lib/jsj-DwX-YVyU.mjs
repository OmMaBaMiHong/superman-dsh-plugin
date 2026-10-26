import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/upc/jsj.ts
const MAP = {
	news: "6277",
	scholar: "6278",
	states: "6279",
	notice: "6280"
};
const HEAD = {
	news: "学院新闻",
	scholar: "学术关注",
	states: "学工动态",
	notice: "通知公告"
};
const route = {
	path: "/jsj/:type",
	categories: ["university"],
	example: "/upc/jsj/news",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "计算机科学与技术学院",
	maintainers: ["Veagau"],
	handler,
	description: `| 学院新闻 | 学术关注 | 学工动态 | 通知公告 |
| -------- | -------- | -------- | -------- |
| news     | scholar  | states   | notice   |`
};
async function handler(ctx) {
	const baseUrl = "https://computer.upc.edu.cn";
	const type = ctx.req.param("type");
	const link = `${baseUrl}/${MAP[type]}/list.htm`;
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const list = $(".list tbody table tr").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const link = a.attr("href");
		return {
			title: a.attr("title"),
			link: link.startsWith("http") ? link : `${baseUrl}${link}`,
			pubDate: parseDate(item.find("div[style]").text(), "YYYY-MM-DD")
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = $(".v_news_content, .wp_articlecontent").html();
		item.pubDate = $(".nr-xinxi i").first().length ? timezone(parseDate($(".nr-xinxi i").first().text(), "YYYY-MM-DD HH:mm:ss"), 8) : item.pubDate;
		return item;
	})));
	return {
		title: HEAD[type] + "-计算机科学与技术学院",
		link,
		description: HEAD[type] + "-计算机科学与技术学院",
		item: out
	};
}
//#endregion
export { route };
