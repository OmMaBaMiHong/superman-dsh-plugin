import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qztc/home/index.ts
const rootUrl = "https://www.qztc.edu.cn/";
const route = {
	path: "/home/:type",
	categories: ["university"],
	example: "/qztc/home/2093",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "首页",
	maintainers: ["iQNRen"],
	url: "www.qztc.edu.cn",
	handler,
	radar: [{
		source: ["www.qztc.edu.cn/:type/list.htm"],
		target: "/home/:type"
	}],
	description: `| 板块     | 参数 |
| -------- | ---- |
| 泉师新闻 | 2093 |
| 通知公告 | 2094 |
| 采购公告 | 2095 |
| 学术资讯 | xszx |
| 招聘信息 | 2226 |`
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
		newItem.description = load(await rofetch(item.link))(".wp_articlecontent").html() || "";
		return newItem;
	})));
	return {
		title: $("head > title").text() + " - 泉州师范学院-首页",
		link: rootUrl + type + "/list.htm",
		item: items
	};
}
//#endregion
export { route };
