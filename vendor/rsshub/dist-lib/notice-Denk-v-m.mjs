import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hdu/cs/notice.ts
const link = "https://computer.hdu.edu.cn";
const host = "https://computer.hdu.edu.cn/6738/list.htm";
const getSingleRecord = async () => {
	const $ = load((await got_default(host)).data);
	return $(".posts-list").find("li").toArray().map((item) => {
		item = $(item);
		const date = item.find(".date").text().slice(1, -1);
		return {
			title: item.find("a").text(),
			pubDate: parseDate(date),
			link: link + item.find("a").attr("href")
		};
	});
};
const route = {
	path: "/cs",
	categories: ["university"],
	example: "/hdu/cs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["computer.hdu.edu.cn/6738/list.htm"] }],
	name: "计算机学院 - 通知公告",
	maintainers: ["legr4ndk"],
	handler,
	url: "computer.hdu.edu.cn/6738/list.htm"
};
async function handler() {
	const items = await getSingleRecord();
	const out = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		return {
			title: item.title,
			link: item.link,
			description: $(".wp_articlecontent").html(),
			pubDate: item.pubDate
		};
	})));
	return {
		title: "杭电计算机-通知公告",
		description: "杭州电子科技大学计算机学院-通知公告",
		link: host,
		item: out
	};
}
//#endregion
export { route };
