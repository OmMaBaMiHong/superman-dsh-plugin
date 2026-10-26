import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tongji/gs.ts
const route = {
	path: "/gs",
	categories: ["university"],
	example: "/tongji/gs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gs.tongji.edu.cn/tzgg.htm", "gs.tongji.edu.cn/"] }],
	name: "研究生院通知公告",
	maintainers: ["sitdownkevin"],
	handler,
	url: "gs.tongji.edu.cn/tzgg.htm"
};
async function getNoticeContent(item) {
	item.description = load((await got_default(item.link)).body)("#vsb_content").html();
	return item;
}
async function handler() {
	const baseUrl = "https://gs.tongji.edu.cn";
	const $ = load((await got_default(`${baseUrl}/tzgg.htm`)).body);
	const items = $("body > div > div.con_list.ma0a > div > div.list_content_right > div.list_list > ul").find("li").toArray().map((item) => {
		const title = $(item).find("a").attr("title");
		const linkRaw = $(item).find("a").attr("href");
		return {
			title,
			link: linkRaw.startsWith("http") ? linkRaw : `${baseUrl}/${linkRaw}`,
			pubDate: parseDate($(item).find("span").text(), "YYYY-MM-DD")
		};
	});
	return {
		title: "同济大学研究生院",
		link: baseUrl,
		description: "同济大学研究生院通知公告",
		image: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		icon: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		logo: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, () => getNoticeContent(item))))
	};
}
//#endregion
export { route };
