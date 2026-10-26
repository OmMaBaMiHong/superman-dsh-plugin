import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/rustcc/jobs.ts
const base_url = "https://rustcc.cn";
const route = {
	path: "/jobs",
	categories: ["programming"],
	example: "/rustcc/jobs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["rustcc.cn/"] }],
	name: "招聘",
	maintainers: ["CcccFz"],
	handler,
	url: "rustcc.cn/"
};
async function handler() {
	const jobs_url = "https://rustcc.cn/section?id=fed6b7de-0a74-48eb-8988-1978858c9b35";
	const list = load((await got_default({
		url: jobs_url,
		headers: { Referer: base_url }
	})).data)(".article-list li").toArray();
	return {
		title: "Rust语言中文社区 | 招聘",
		link: jobs_url,
		description: "获取Rust语言中文社区的最新招聘",
		item: await Promise.all(list.map((item) => getFeedItem(item)))
	};
}
function getFeedItem(item) {
	const $ = load(item);
	const title = $(".title");
	return {
		title: title.text(),
		link: `${base_url}${title.attr("href")}`,
		description: $(".info .tags").text(),
		pubDate: timezone(parseDate($(".info .timestamp").text(), "YYYY-MM-DD hh:mm"), 8)
	};
}
//#endregion
export { route };
