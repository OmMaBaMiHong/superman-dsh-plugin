import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cloudnative/blog.ts
async function getArticles() {
	const { data: res } = await got_default("https://cloudnative.to/blog/");
	const $ = load(res);
	return $("div.page-body .stream-item").toArray().map((elem) => {
		const a = $(elem).find(".article-title > a");
		const summary = $(elem).find(".summary-link");
		const meta = $(elem).find(".stream-meta .article-metadata");
		const time = meta.find(".article-date").text().replace("发布于", "");
		return {
			title: a.text(),
			link: a.attr("href"),
			description: summary.text(),
			pubDate: timezone(parseDate(time, "YYYY-MM-DD"), 8),
			author: meta.find("span").eq(0).find("a").text(),
			category: meta.find(".article-categories a").text()
		};
	});
}
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/cloudnative/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "博客",
	maintainers: ["aneasystone"],
	handler
};
async function handler() {
	return {
		title: "博客 | 云原生社区（中国）",
		link: "https://cloudnative.to/blog/",
		item: await getArticles()
	};
}
//#endregion
export { route };
