import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qztc/sjxy/index.ts
const rootUrl = "https://www.qztc.edu.cn/sjxy/";
const host = "www.qztc.edu.cn";
const route = {
	path: "/sjxy/:type",
	categories: ["university"],
	example: "/qztc/sjxy/1939",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "数学与计算机科学学院 软件学院",
	maintainers: ["iQNRen"],
	url: "www.qztc.edu.cn",
	handler,
	radar: [{
		source: ["www.qztc.edu.cn/sjxy/:type/list.htm"],
		target: "/sjxy/:type"
	}],
	description: `| 板块     | 参数 |
| -------- | ---- |
| 学院概况 | 1938 |
| 学院动态 | 1939 |
| 学科建设 | 1940 |
| 教学教务 | 1941 |
| 人才培养 | 1942 |
| 科研工作 | 1943 |
| 党群工作 | 1944 |
| 团学工作 | 1945 |
| 资料下载 | 1947 |
| 采购信息 | 1948 |
| 信息公开 | xxgk |`
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
		title: $("head > title").text() + " - 泉州师范学院-数学与计算机科学学院 软件学院",
		link: rootUrl + type + "/list.htm",
		item: items
	};
}
//#endregion
export { route };
