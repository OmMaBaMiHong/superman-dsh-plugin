import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tingshuitz/dalian.ts
const route = {
	path: "/dalian",
	categories: ["forecast"],
	example: "/tingshuitz/dalian",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["swj.dl.gov.cn/col/col4296/index.html", "swj.dl.gov.cn/"] }],
	name: "大连市",
	maintainers: ["DIYgod"],
	handler,
	url: "swj.dl.gov.cn/col/col4296/index.html"
};
async function handler() {
	const $ = load((await got_default("https://swj.dl.gov.cn/module/web/jpage/dataproxy.jsp?page=1&webid=28&path=https://swj.dl.gov.cn/&columnid=4296&unitid=31227&webname=%25E5%25A4%25A7%25E8%25BF%259E%25E5%25B8%2582%25E6%25B0%25B4%25E5%258A%25A1%25E5%25B1%2580&permissiontype=0")).data);
	return {
		title: "停水通知 - 大连市水务局",
		link: "https://swj.dl.gov.cn/col/col4296/index.html",
		description: "停水通知 - 大连市水务局",
		item: $("recordset record").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").text().trim(),
				description: `大连市停水通知：${item.find("a").text().trim()}`,
				pubDate: parseDate(item.find("span").text(), "YYYY-MM-DD"),
				link: item.find("a").attr("href")
			};
		})
	};
}
//#endregion
export { route };
