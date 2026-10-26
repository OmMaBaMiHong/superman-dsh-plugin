import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qlu/notice.ts
const host = "https://www.qlu.edu.cn";
const route = {
	path: "/notice",
	categories: ["university"],
	example: "/qlu/notice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["qlu.edu.cn/tzggsh/list1.htm"] }],
	name: "通知公告",
	maintainers: ["SunBK201"],
	handler,
	url: "qlu.edu.cn/tzggsh/list1.htm"
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: `${host}/tzggsh/list1.htm`
	})).data);
	const list = $("ul.news_list.list2").children();
	const items = await Promise.all(list.map((i, item) => {
		item = $(item);
		const itemTitle = item.find(".news_title").children().text();
		const itemDate = item.find(".news_year").text() + item.find(".news_days").text();
		const path = item.find(".news_title").children().attr("href");
		const itemUrl = path.startsWith("https") ? path : host + path;
		return cache_default.tryGet(itemUrl, async () => {
			let description;
			if (path.startsWith("https")) description = itemTitle;
			else description = load((await got_default(itemUrl)).data)(".read").html().trim();
			return {
				title: itemTitle,
				link: itemUrl,
				pubDate: timezone(parseDate(itemDate), 8),
				description
			};
		});
	}));
	return {
		title: "齐鲁工业大学 - 通知公告",
		link: `${host}/tzggsh/list1.htm`,
		description: "齐鲁工业大学 - 通知公告",
		item: items
	};
}
//#endregion
export { route };
