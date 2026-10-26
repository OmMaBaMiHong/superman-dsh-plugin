import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zjuvag/blog.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/zjuvag/blog",
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
	maintainers: ["KaiyoungYu"],
	handler
};
async function handler() {
	const { data: response } = await got_default("https://zjuvag.org/blog/");
	const $ = load(response);
	return {
		title: "浙江大学可视分析小组博客",
		link: "https://zjuvag.org/blog/",
		item: $("div.post-preview-container").find(".post-preview").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").first().text(),
				link: `https://zjuvag.org${item.find("a").first().attr("href")}`,
				pubDate: timezone(parseDate(item.find(".post-time").text(), "YYYY-MM-DD"), 0),
				author: item.find(".tag").first().text()
			};
		})
	};
}
//#endregion
export { route };
