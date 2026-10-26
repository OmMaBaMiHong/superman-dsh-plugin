import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/cls/lecture.ts
const homeUrl = "http://bio.pku.edu.cn/homes/Index/news_jz/7/7.html";
const baseUrl = "http://bio.pku.edu.cn";
const route = {
	path: "/cls/lecture",
	categories: ["university"],
	example: "/pku/cls/lecture",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bio.pku.edu.cn/homes/Index/news_jz/7/7.html", "bio.pku.edu.cn/"] }],
	name: "生命科学学院近期讲座",
	maintainers: ["TPOB"],
	handler,
	url: "bio.pku.edu.cn/homes/Index/news_jz/7/7.html"
};
async function handler() {
	const $ = load((await got_default(homeUrl)).data);
	return {
		title: "北京大学生命科学学院近期讲座",
		link: homeUrl,
		description: "北京大学生命科学学院近期讲座",
		item: $("a.clearfix").toArray().map((item) => ({
			title: $(item).find("p").text().trim(),
			description: "日期: " + $(item).find("span"),
			pubDate: parseDate($(item).find(".date").text()),
			link: baseUrl + $("a.clearfix").attr("href")
		}))
	};
}
//#endregion
export { route };
