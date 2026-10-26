import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nuist/sese.ts
const baseUrl = "https://sese.nuist.edu.cn";
const route = {
	path: "/sese/:category?",
	categories: ["university"],
	example: "/nuist/sese/tzgg1",
	parameters: { category: "默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "NUIST ESE（南信大环科院）",
	maintainers: ["gylidian"],
	handler,
	description: `| 通知公告 | 新闻快讯 | 学术动态 | 学生工作 | 研究生教育 | 本科教育 |
| -------- | -------- | -------- | -------- | ---------- | -------- |
| tzgg1    | xwkx     | xsdt1    | xsgz1    | yjsjy1     | bkjy1    |`
};
async function handler(ctx) {
	const { category = "tzgg1" } = ctx.req.param();
	const link = `${baseUrl}/${category}.htm`;
	const $ = load((await got_default(link)).data);
	const list = $("#ctl00_ctl00_mainbody_rightbody_listcontent_NewsList .gridline").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").eq(1).text(),
			link: new URL(item.find("a").eq(1).attr("href"), baseUrl).href,
			category: item.find("a").eq(0).text(),
			pubDate: parseDate($(item).find(".gridlinedate").text(), "YYYY年MM月DD日")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("#vsb_content_6").html();
		return item;
	})));
	return {
		title: "NUIST ESE（南信大环科院）：" + $(".lmtitle").text(),
		description: $("meta[name=description]").attr("content"),
		link,
		item: items
	};
}
//#endregion
export { route };
