import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zjut/jwc/index.ts
const rootUrl = "http://www.jwc.zjut.edu.cn/";
const host = "www.jwc.zjut.edu.cn";
const route = {
	path: "/jwc/:type",
	categories: ["university"],
	example: "/zjut/jwc/1839",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "浙江工业大学教务处",
	maintainers: ["zhullyb"],
	url: "www.jwc.zjut.edu.cn",
	handler,
	radar: [{
		source: ["www.jwc.zjut.edu.cn/:type/list.htm"],
		target: "/jwc/:type"
	}],
	description: `| 板块          | 参数 |
| ------------- | ---- |
| 新闻动态      | 1838 |
| 课程思政      | 1842 |
| 校内动态      | 2613 |
| 学习思考      | 2614 |
| 成果展示      | 2615 |
| 媒体聚焦      | 2616 |
| 制度文件      | 2617 |
| 教学运行      | 1849 |
| 实践竞赛      | 1850 |
| 留学生 Notice | 1851 |
| 项目申报      | 1852 |
| 学籍管理      | 1853 |
| 办事指南      | 1839 |`
};
async function handler(ctx) {
	const type = Number.parseInt(ctx.req.param("type"));
	const $ = load(await rofetch(rootUrl + type + "/list.htm"));
	const list = $(".news.clearfix").toArray().map((item) => {
		const cheerioItem = $(item);
		const a = cheerioItem.find("a");
		try {
			const title = a.attr("title") || "";
			let link = a.attr("href");
			if (!link) link = "";
			else if (!link.startsWith("http")) link = rootUrl.slice(0, -1) + link;
			const pubDate = timezone(parseDate(cheerioItem.find(".news_meta").text()), 8);
			return {
				title,
				link,
				pubDate
			};
		} catch {
			return {
				title: "",
				link: "",
				pubDate: Date.now()
			};
		}
	}).filter((item) => item.title && item.link);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const newItem = {
			...item,
			description: ""
		};
		if (host === new URL(item.link).hostname) if (new URL(item.link).pathname.startsWith("/_upload")) newItem.description = item.link;
		else newItem.description = load(await rofetch(item.link))(".wp_articlecontent").html() || "";
		else newItem.description = item.link;
		return newItem;
	})));
	return {
		title: $("head > title").text() + " - 浙江工业大学教务处",
		link: rootUrl + type + "/list.htm",
		item: items
	};
}
//#endregion
export { route };
