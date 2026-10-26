import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tongji/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/tongji/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yz.tongji.edu.cn/zsxw/ggtz.htm", "yz.tongji.edu.cn/"] }],
	name: "研究生招生网通知公告",
	maintainers: ["shengmaosu", "sitdownkevin"],
	handler,
	url: "yz.tongji.edu.cn/zsxw/ggtz.htm"
};
async function getNoticeContent(item) {
	item.description = load((await got_default(item.link)).data)("#vsb_content").html();
	return item;
}
async function handler() {
	const baseUrl = "https://yz.tongji.edu.cn";
	const $ = load((await got_default(`${baseUrl}/zsxw/ggtz.htm`)).body);
	const items = $("#content-box > div.content > div.list_main_content > ul").find("li").toArray().map((item) => {
		const title = $(item).find("a").attr("title");
		const linkRaw = $(item).find("a").attr("href");
		return {
			title,
			link: linkRaw.startsWith("http") ? linkRaw : new URL(linkRaw, `${baseUrl}/zsxw`).href,
			pubDate: parseDate($(item).find("span").text(), "YYYY-MM-DD")
		};
	});
	return {
		title: "同济大学研究生招生网",
		link: baseUrl,
		description: "同济大学研究生招生网通知公告",
		image: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		icon: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		logo: "https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg",
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, () => getNoticeContent(item))))
	};
}
//#endregion
export { route };
