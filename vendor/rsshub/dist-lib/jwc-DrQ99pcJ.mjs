import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qdu/jwc.ts
const base = "https://jwc.qdu.edu.cn/";
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/qdu/jwc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jwc.qdu.edu.cn/jwtz.htm", "jwc.qdu.edu.cn/"] }],
	name: "教务处通知",
	maintainers: ["abc1763613206"],
	handler,
	url: "jwc.qdu.edu.cn/jwtz.htm"
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: `${base}jwtz.htm`
	})).data);
	const list = $(".notice_item").children();
	const items = await Promise.all(list.map((i, item) => {
		item = $(item);
		const itemTitle = item.find(".active").text();
		const itemDate = item.find("span").text();
		const path = item.find(".active").attr("href");
		let itemUrl = "";
		itemUrl = path.startsWith("http") ? path : base + path;
		return cache_default.tryGet(itemUrl, async () => {
			let description;
			if (path.startsWith("http")) description = itemTitle;
			else {
				const $ = load((await got_default(itemUrl)).data);
				description = $("title").text() === "系统提示" ? itemTitle : $(".v_news_content").html().trim();
			}
			return {
				title: itemTitle,
				link: itemUrl,
				pubDate: timezone(parseDate(itemDate), 8),
				description
			};
		});
	}));
	return {
		title: "青岛大学 - 教务处通知",
		link: `${base}jwtz.htm`,
		description: "青岛大学 - 教务处通知",
		item: items
	};
}
//#endregion
export { route };
