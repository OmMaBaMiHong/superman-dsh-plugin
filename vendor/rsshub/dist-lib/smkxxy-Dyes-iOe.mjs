import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cnu/smkxxy.ts
const route = {
	path: "/smkxxy",
	categories: ["university"],
	example: "/cnu/smkxxy",
	parameters: {},
	radar: [{
		source: ["smkxxy.cnu.edu.cn/tzgg3/index.htm"],
		target: "/cnu/smkxxy"
	}],
	name: "生命科学学院通知公告",
	maintainers: ["liueic"],
	handler,
	url: "smkxxy.cnu.edu.cn/tzgg3/index.htm",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	}
};
async function handler() {
	const baseUrl = "https://smkxxy.cnu.edu.cn";
	const link = `${baseUrl}/tzgg3/index.htm`;
	const $ = load((await got_default(link)).data);
	return {
		title: "首都师范大学生命科学学院 - 通知公告",
		link,
		description: "首都师范大学生命科学学院通知公告",
		item: $("ul.block-list > li > a").toArray().map((e) => {
			const item = $(e);
			const href = item.attr("href");
			const linkUrl = href?.startsWith("http") ? href : `${baseUrl}/tzgg3/${href}`;
			return {
				title: item.find("p.gpArticleTitle").text().trim(),
				link: linkUrl,
				pubDate: parseDate(item.find("span.gpArticleDate").text().trim(), "YYYY-MM-DD"),
				description: ""
			};
		})
	};
}
//#endregion
export { route };
