import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xbmu/announcement.ts
const BASE_URL = "https://www.xbmu.edu.cn/xwzx/tzgg.htm";
const handler = async () => {
	try {
		const { data: listResponse } = await got_default(BASE_URL);
		const $ = load(listResponse);
		const listItems = $("body > div.container.list-container.ny_mani > div > div.news_list > ul > li");
		const announcementLinkList = await Promise.all(listItems.toArray().map((element) => {
			const [day, yearMonth] = $(element).find("span").text().trim().split("/").map((s) => s.trim());
			return {
				date: parseDate(`${yearMonth}-${day}`).toUTCString(),
				title: $(element).find("a").attr("title") || "通知公告",
				link: `https://www.xbmu.edu.cn/${($(element).find("a").attr("href") || "").replaceAll("../", "")}`
			};
		}));
		return {
			title: "西北民族大学通知公告",
			description: "西北民族大学近日通知公告",
			link: BASE_URL,
			image: "http://210.26.0.114:9090/mdxg/img/weex/default_img.jpg",
			item: await Promise.all(announcementLinkList.map((item) => cache_default.tryGet(item.link, async () => {
				const CONTENT_SELECTOR = "#vsb_content > div";
				const { data: contentResponse } = await got_default(item.link);
				const content = load(contentResponse)(CONTENT_SELECTOR).html() || "";
				return {
					title: item.title,
					pubDate: item.date,
					link: item.link,
					description: content,
					category: ["university"],
					guid: item.link,
					id: item.link,
					image: "http://210.26.0.114:9090/mdxg/img/weex/default_img.jpg",
					content,
					updated: item.date,
					language: "zh-cn"
				};
			}))),
			allowEmpty: true,
			language: "zh-cn",
			feedLink: "https://rsshub.app/xbmu/announcement",
			id: "https://rsshub.app/xbmu/announcement"
		};
	} catch (error) {
		throw new Error(`Error fetching announcements: ${error}`, { cause: error });
	}
};
const route = {
	path: "/announcement",
	name: "通知公告",
	maintainers: ["PrinOrange"],
	handler,
	categories: ["university"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	example: "/xbmu/announcement"
};
//#endregion
export { route };
