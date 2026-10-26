import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zjut/cs/index.ts
const rootUrl = "https://cs.zjut.edu.cn/jsp/newsclass.jsp?wcId=";
const host = "cs.zjut.edu.cn";
const route = {
	path: "/cs/:type",
	categories: ["university"],
	example: "/zjut/cs/54",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "浙江工业大学计算机科学与技术学院、软件学院",
	maintainers: ["zhullyb"],
	url: "cs.zjut.edu.cn",
	handler,
	radar: [{
		source: ["cs.zjut.edu.cn/jsp/newsclass.jsp"],
		target: "/cs/:type"
	}],
	description: `| 新闻资讯 | 学术动态 | 通知公告 |
| -------- | -------- | -------- |
| 54       | 55       | 53       |`
};
async function handler(ctx) {
	const type = Number.parseInt(ctx.req.param("type"));
	const $ = load(await rofetch(rootUrl + type));
	const list = $("dl.news").toArray().map((item) => {
		const cheerioItem = $(item);
		const a = cheerioItem.find("a");
		try {
			const title = a.text() || "";
			let link = a.attr("href");
			if (!link) link = "";
			else if (!link.startsWith("http")) link = "https://cs.zjut.edu.cn/jsp/" + link;
			const pubDate = timezone(parseDate(cheerioItem.find(".datetime").text().slice(1, -1)), 8);
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
		if (host === new URL(item.link).hostname) if (new URL(item.link).pathname.startsWith("/upload")) newItem.description = item.link;
		else newItem.description = load(await rofetch(item.link))("div.news1content").html() || "";
		else newItem.description = item.link;
		return newItem;
	})));
	return {
		title: $("li#classname").text() + " - 浙江工业大学计算机科学与技术学院、软件学院",
		link: rootUrl + type,
		item: items
	};
}
//#endregion
export { route };
