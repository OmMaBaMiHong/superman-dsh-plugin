import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/hlju/news.ts
const route = {
	path: "/news/:category?",
	categories: ["university"],
	example: "/hlju/news/hdyw",
	parameters: { category: {
		description: "新闻分类，默认为黑大要闻",
		options: [
			{
				value: "hdyw",
				label: "黑大要闻"
			},
			{
				value: "jjxy",
				label: "菁菁校园"
			},
			{
				value: "rwfc",
				label: "人物风采"
			},
			{
				value: "xwdt",
				label: "新闻动态"
			},
			{
				value: "jxky",
				label: "教学科研"
			},
			{
				value: "xyjw",
				label: "学院经纬"
			},
			{
				value: "jlhz",
				label: "交流合作"
			},
			{
				value: "cxcy",
				label: "创新创业"
			}
		]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["hdxw.hlju.edu.cn/:category.htm", "hdxw.hlju.edu.cn/"],
		target: "/news/:category"
	}],
	name: "新闻网",
	maintainers: ["LCMs-YoRHa"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "hdyw";
	const baseUrl = "https://hdxw.hlju.edu.cn";
	const listUrl = `${baseUrl}/${category}.htm`;
	const $ = load(await rofetch(listUrl));
	const categoryName = $(".bgtitle_list").text().trim() || "黑大要闻";
	const uniqueList = $("a[href*=\"info/\"]").toArray().map((element) => {
		const item = $(element);
		const link = item.attr("href");
		const title = item.text().trim();
		if (!title || !link || title.length < 5) return null;
		const dateMatch = item.parent().text().match(/(\d{4})\/(\d{2})\/(\d{2})/);
		return {
			title,
			link: link.startsWith("http") ? link : `${baseUrl}/${link}`,
			pubDate: dateMatch ? parseDate(dateMatch[0].replaceAll("/", "-")) : void 0
		};
	}).filter((item) => item !== null).filter((item, index, arr) => arr.findIndex((i) => i.link === item.link) === index).slice(0, 15);
	const items = await Promise.all(uniqueList.map((item) => cache_default.tryGet(item.link, async () => {
		if (!item.link.includes("hdxw.hlju.edu.cn")) return {
			title: item.title,
			link: item.link,
			description: "外部链接，请点击查看原文",
			pubDate: item.pubDate
		};
		const $detail = load(await rofetch(item.link));
		const content = $detail(".v_news_content");
		let description;
		if (content.length > 0) {
			content.find("script, style, .print, .share").remove();
			description = content.html() || "";
		} else description = "内容获取失败，请点击查看原文";
		let pubDate = item.pubDate;
		const timeElement = $detail(".timestyle110144");
		if (timeElement.length > 0) {
			const timeMatch = timeElement.text().trim().match(/(\d{4}[-/]\d{2}[-/]\d{2})\s*(\d{2}:\d{2}(?::\d{2})?)/);
			if (timeMatch) {
				const dateStr = timeMatch[1].replaceAll("/", "-");
				const timeStr = timeMatch[2];
				pubDate = parseDate(`${dateStr} ${timeStr}`);
			}
		}
		return {
			title: item.title,
			link: item.link,
			description: description || "无法获取文章内容，请点击查看原文",
			pubDate
		};
	})));
	return {
		title: `黑龙江大学新闻网 - ${categoryName}`,
		link: listUrl,
		description: `黑龙江大学新闻网${categoryName}栏目`,
		item: items
	};
}
//#endregion
export { route };
