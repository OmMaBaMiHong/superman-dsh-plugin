import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tongji/sem/_utils.ts
async function getNotifByPage(url) {
	const pageUrl = url;
	try {
		const html = (await got_default.get(pageUrl, { headers: { "User-Agent": config.ua } })).body;
		const $ = load(html);
		return $("#page-wrap > div.maim_pages > div > div.leftmain_page > div > ul > li").toArray().map((Element) => {
			const aTagFirst = $(Element).find("a.bt");
			const aTagSecond = $(Element).find("a.time");
			return {
				title: aTagFirst.attr("title"),
				link: aTagFirst.attr("href"),
				pubDate: parseDate(aTagSecond.text().trim(), "YYYY-MM-DD")
			};
		});
	} catch {}
	return [];
}
async function getArticle(item) {
	const articleUrl = item.link;
	if (articleUrl.includes("sem.tongji.edu.cn/semch")) try {
		const html = (await got_default.get(articleUrl, { headers: { "User-Agent": config.ua } })).body;
		const articleContentElement = load(html)("#page-wrap > div.maim_pages > div > div.leftmain_page > div");
		item.description = articleContentElement ? articleContentElement.html() : "";
	} catch {}
	return item;
}
//#endregion
//#region lib/routes/tongji/sem/notice.ts
const route = {
	path: "/sem/:type?",
	categories: ["university"],
	example: "/tongji/sem/notice",
	parameters: { type: "通知类型，默认为 `notice`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "经济与管理学院通知",
	maintainers: ["sitdownkevin"],
	url: "sem.tongji.edu.cn/semch",
	handler,
	description: `| 学院通知 | 招生通知   | 学术观点       | 新闻 | 活动   | 视点  | 教师与行政人员招聘 |
| -------- | ---------- | -------------- | ---- | ------ | ----- | ------------------ |
| notice   | enrollment | academic-paper | news | events | focus | collegerecruitment |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "notice";
	const subtype = /* @__PURE__ */ new Set([
		"enrollment",
		"academic-paper",
		"news",
		"events",
		"focus",
		"collegerecruitment"
	]);
	const subtypeName = {
		notice: "学院通知",
		enrollment: "招生通知",
		"academic-paper": "学术观点",
		news: "新闻",
		events: "活动",
		focus: "视点",
		collegerecruitment: "教师与行政人员招聘"
	};
	const results = await getNotifByPage(`https://sem.tongji.edu.cn/semch/category/frontpage/${subtype.has(type) ? type : "notice"}`);
	const resultsWithContent = await Promise.all(results.map((item) => cache_default.tryGet(item.link, () => getArticle(item))));
	return {
		title: "同济大学经济与管理学院",
		description: String(subtype.has(type) ? subtypeName[type] : "学院通知"),
		image: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		icon: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		logo: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		link: "https://sem.tongji.edu.cn/semch",
		item: resultsWithContent
	};
}
//#endregion
export { route };
