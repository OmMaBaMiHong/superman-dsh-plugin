import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hrbeu/job/bigemploy.ts
const route = {
	path: "/job/bigemploy",
	categories: ["university"],
	example: "/hrbeu/job/bigemploy",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["job.hrbeu.edu.cn/*"] }],
	name: "大型招聘会",
	maintainers: ["Derekmini"],
	handler,
	url: "job.hrbeu.edu.cn/*"
};
async function handler() {
	const $ = load((await got_default("http://job.hrbeu.edu.cn/HrbeuJY/web")).data);
	return {
		title: "大型招聘会",
		link: "http://job.hrbeu.edu.cn/HrbeuJY/web",
		item: $("div.articlecontent").toArray().map((item) => ({
			title: $(item).find("a.bigTitle").text(),
			pubDate: parseDate($(item).find("p").eq(1).text().replace("时间:", "").trim()),
			description: "点击标题，登录查看招聘详情",
			link: $(item).find("a.bigTitle").attr("href")
		})),
		allowEmpty: true
	};
}
//#endregion
export { route };
