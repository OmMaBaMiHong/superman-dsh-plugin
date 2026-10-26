import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cnu/iec.ts
const route = {
	path: "/iec",
	categories: ["university"],
	example: "/cnu/iec",
	parameters: {},
	radar: [{
		source: ["iec.cnu.edu.cn/ggml/tzgg1/index.htm"],
		target: "/cnu/iec"
	}],
	name: "信息工程学院通知公告",
	maintainers: ["liueic"],
	handler,
	url: "iec.cnu.edu.cn/ggml/tzgg1/index.htm",
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
	const baseUrl = "https://iec.cnu.edu.cn";
	const link = `${baseUrl}/ggml/tzgg1/index.htm`;
	const $ = load((await got_default(link)).data);
	return {
		title: "首都师范大学信息工程学院 - 通知公告",
		link,
		description: "首都师范大学信息工程学院通知公告",
		item: $(".articleList.articleList2 ul > li").toArray().map((e) => {
			const item = $(e);
			const span = item.find("span");
			const a = item.find("a");
			const dateMatch = span.text().trim().match(/\[(\d{4}-\d{2}-\d{2})\]/);
			const pubDate = dateMatch ? parseDate(dateMatch[1], "YYYY-MM-DD") : void 0;
			const title = a.text().trim();
			const href = a.attr("href");
			return {
				title,
				link: href?.startsWith("http") ? href : `${baseUrl}/ggml/tzgg1/${href}`,
				pubDate,
				description: ""
			};
		}).filter((item) => item.title && item.link)
	};
}
//#endregion
export { route };
