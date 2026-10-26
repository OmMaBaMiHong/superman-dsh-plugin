import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qztc/jwc/index.ts
const rootUrl = "https://www.qztc.edu.cn/jwc/";
const host = "www.qztc.edu.cn";
const route = {
	path: "/jwc/:type",
	categories: ["university"],
	example: "/qztc/jwc/jwdt",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	maintainers: ["iQNRen"],
	url: "www.qztc.edu.cn",
	handler,
	radar: [{
		source: ["www.qztc.edu.cn/jwc/:type/list.htm"],
		target: "/jwc/:type"
	}],
	description: `| 板块     | 参数 |
| -------- | ---- |
| 教务动态 | jwdt |
| 首 页    | 1020 |
| 岗位介绍 | 1021 |
| 管理文件 | 1022 |
| 教学教改 | 1023 |
| 办事指南 | 1024 |
| 通知公告 | 1025 |
| 下载中心 | 1026 |
| 对外交流 | 1027 |
| 政策文件 | 1028 |
| 会议纪要 | 1029 |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
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
		title: $("head > title").text() + " - 泉州师范学院-教务处",
		link: rootUrl + type + "/list.htm",
		item: items
	};
}
//#endregion
export { route };
