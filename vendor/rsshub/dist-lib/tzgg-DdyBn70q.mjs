import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scu/jwc/tzgg.ts
const baseUrl = "https://jwc.scu.edu.cn/tzgg.htm";
const baseIndexUrl = "https://jwc.scu.edu.cn/";
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/scu/jwc",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jwc.scu.edu.cn"],
		target: "/jwc"
	}],
	name: "教务处通知公告",
	maintainers: ["Kyle-You"],
	handler
};
async function handler() {
	const { data: response } = await got_default.get(baseUrl);
	const $ = load(response);
	const links = $(".tz-list ul li a").toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return link.startsWith("http") ? link : baseIndexUrl + link;
	});
	const items = await Promise.all(links.map((link) => cache_default.tryGet(link, async () => {
		const { data: info } = await got_default.get(link);
		const $ = load(info);
		return {
			title: $("head meta[name=\"ArticleTitle\"]").attr("content") ?? "",
			link,
			pubDate: parseDate($("head meta[name=\"PubDate\"]").attr("content") ?? ""),
			description: $(".v_news_content").html()
		};
	})));
	return {
		title: "四川大学教务处",
		link: baseIndexUrl,
		description: "四川大学教务处通知公告",
		item: items,
		language: "zh-cn",
		image: "https://www.scu.edu.cn/__local/B/67/25/DFAF986CCD6529E52D7830F180D_C37C7DEE_4340.png",
		logo: "https://www.scu.edu.cn/__local/B/67/25/DFAF986CCD6529E52D7830F180D_C37C7DEE_4340.png",
		icon: "https://www.scu.edu.cn/__local/B/67/25/DFAF986CCD6529E52D7830F180D_C37C7DEE_4340.png"
	};
}
//#endregion
export { route };
