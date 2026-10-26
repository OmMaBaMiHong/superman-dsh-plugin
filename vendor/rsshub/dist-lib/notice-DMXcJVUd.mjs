import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/aliyun/notice.ts
const typeMap = {
	0: "9004748",
	1: "9004749",
	2: "9213612",
	3: "8314815",
	4: "9222707"
};
/**
*
* @param ctx {import('koa').Context}
*/
const route = {
	path: "/notice/:type?",
	categories: ["programming"],
	example: "/aliyun/notice",
	parameters: { type: "N" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公告",
	maintainers: ["muzea"],
	handler,
	description: `| 类型     | type |
| -------- | ---- |
| 全部     |      |
| 升级公告 | 1    |
| 安全公告 | 2    |
| 备案公告 | 3    |
| 其他     | 4    |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const url = `https://help.aliyun.com/noticelist/${typeMap[type] || typeMap[0]}.html`;
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	const list = $("ul > li.notice-li").toArray().map((e) => {
		const element = $(e);
		return {
			title: element.find("a").text().trim(),
			description: "",
			link: "https://help.aliyun.com" + element.find("a").attr("href").trim(),
			pubDate: timezone(parseDate(element.find(".y-right").text()), 8)
		};
	});
	const result = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("#se-knowledge").html();
		return item;
	})));
	return {
		title: $("title").text().trim(),
		link: url,
		item: result
	};
}
//#endregion
export { route };
