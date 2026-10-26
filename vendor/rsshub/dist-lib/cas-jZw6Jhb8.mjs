import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nuist/cas.ts
const baseUrl = "https://cas.nuist.edu.cn";
const route = {
	path: "/cas/:category?",
	categories: ["university"],
	example: "/nuist/cas/xxgg",
	parameters: { category: "默认为信息公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "NUIST AS（南信大大气科学学院）",
	maintainers: ["gylidian"],
	handler,
	description: `| 信息公告 | 新闻快讯 | 科学研究 | 网上公示 | 本科教育 | 研究生教育 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| xxgg     | xwkx     | kxyj     | wsgs     | bkjy     | yjsjy      |`
};
async function handler(ctx) {
	const { category = "xxgg" } = ctx.req.param();
	const link = `${baseUrl}/index/${category}.htm`;
	const $ = load((await got_default(link)).data);
	const list = $("#ctl00_ctl00_body_NewsList").find("tr.gridline").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".Title").text().trim(),
			link: new URL(item.find(".Title").attr("href"), baseUrl).href,
			pubDate: parseDate(item.find("td").eq(2).text().replaceAll(/[[\]]+/g, ""), "YYYY.MM.DD")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $ = load((await got_default(item.link)).data);
			const authorMatch = $(".zzxx").text().match(/作者:(.*) 发布时间/);
			item.author = authorMatch ? authorMatch[1].trim() : null;
			item.pubDate = timezone(parseDate(item.find(".zzxx").text().match(/发布时间:(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/)[1]), 8);
			item.description = $("#vsb_content").html();
		} catch {}
		return item;
	})));
	return {
		title: "NUIST AS（南信大大气科学学院）：" + $(".dqlm").find("a").eq(1).text(),
		description: $("meta[name=description]").attr("content"),
		link,
		item: items
	};
}
//#endregion
export { route };
