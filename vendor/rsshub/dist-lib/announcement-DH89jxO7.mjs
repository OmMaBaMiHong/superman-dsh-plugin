import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/cls/announcement.ts
const homeUrl = "https://bio.pku.edu.cn/homes/Index/news/21/21.html";
const baseUrl = "https://bio.pku.edu.cn";
const route = {
	path: "/cls/announcement",
	categories: ["university"],
	example: "/pku/cls/announcement",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bio.pku.edu.cn/homes/Index/news/21/21.html", "bio.pku.edu.cn/"] }],
	name: "生命科学学院通知公告",
	maintainers: ["william-swl"],
	handler,
	url: "bio.pku.edu.cn/homes/Index/news/21/21.html"
};
async function handler() {
	const $ = load((await got_default(homeUrl)).data);
	const list = $("div.normal_list>ul a").toArray().map((item) => {
		item = $(item);
		return {
			title: $(item).find("p").text().trim(),
			pubDate: parseDate($(item).find("span.date").text()),
			link: baseUrl + $(item).attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)("div.page div.common_width div.col-md-9").first().html();
		return item;
	})));
	return {
		title: "北京大学生命科学学院通知公告",
		link: homeUrl,
		item: items
	};
}
//#endregion
export { route };
