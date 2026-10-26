import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/apache/apisix/blog.ts
async function getArticles() {
	const { data: res } = await got_default("https://apisix.apache.org/zh/blog/");
	const $ = load(res);
	return $("section.sec_gjjg").eq(1).find("article").toArray().map((elem) => {
		const a = $(elem).find("header > a");
		return {
			title: a.find("h2").text(),
			description: a.find("p").text(),
			link: a.attr("href"),
			pubDate: parseDate($(elem).find("footer").find("time").attr("datetime")),
			category: $(elem).find("header div a").toArray().map((elem) => $(elem).text())
		};
	});
}
const route = {
	path: "/apisix/blog",
	categories: ["blog"],
	example: "/apache/apisix/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "APISIX 博客",
	maintainers: ["aneasystone"],
	handler
};
async function handler() {
	return {
		title: "Blog | Apache APISIX",
		link: "https://apisix.apache.org/zh/blog/",
		item: await getArticles()
	};
}
//#endregion
export { route };
