import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/rccp/mzyt.ts
const baseUrl = "https://www.rccp.pku.edu.cn/mzyt/";
const route = {
	path: "/rccp/mzyt",
	categories: ["university"],
	example: "/pku/rccp/mzyt",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.rccp.pku.edu.cn/"] }],
	name: "每周一推 - 中国政治学研究中心",
	maintainers: ["vhxubo"],
	handler,
	url: "www.rccp.pku.edu.cn/"
};
async function handler() {
	const $ = load((await got_default(baseUrl)).data);
	return {
		title: "每周一推 - 北京大学中国政治学研究中心",
		link: baseUrl,
		description: $("meta[name=\"description\"]").attr("content"),
		item: $("li.list").toArray().map((item) => ({
			title: $(item).find("a").text().trim(),
			description: "",
			pubDate: parseDate($(item).find("span").first().text(), "[YYYY-MM-DD]"),
			link: baseUrl + $(item).find("a").attr("href")
		}))
	};
}
//#endregion
export { route };
