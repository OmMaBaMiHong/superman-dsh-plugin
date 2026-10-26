import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nuist/scs.ts
const baseUrl = "https://scs.nuist.edu.cn";
const route = {
	path: "/scs/:category?",
	categories: ["university"],
	example: "/nuist/scs/xwkx",
	parameters: { category: "默认为新闻快讯" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["scs.nuist.edu.cn/:category/list.htm"],
		target: "/scs/:category"
	}],
	name: "NUIST CS（南信大计软院）",
	maintainers: ["gylidian"],
	handler,
	description: `| 新闻快讯 | 通知公告 | 教务信息 | 科研动态 | 学子风采 |
| -------- | -------- | -------- | -------- | -------- |
| xwkx     | tzgg     | jwxx     | kydt     | xzfc     |`
};
async function handler(ctx) {
	const { category = "xwkx" } = ctx.req.param();
	const link = `${baseUrl}/${category}/list.htm`;
	const $ = load((await got_default(link)).data);
	const list = $(".newsList ul").eq(0).find("li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: new URL(item.find("a").attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".newsDate").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		const authorMatch = $(".newsTitleAddDate").text().match(/发布者：(.*)发布时间/);
		item.author = authorMatch ? authorMatch[1].trim() : null;
		item.description = $(".newsContent").html();
		return item;
	})));
	return {
		title: "NUIST CS（南信大计软院）：" + $("head title").text(),
		description: $("meta[name=description]").attr("content"),
		link,
		item: items
	};
}
//#endregion
export { route };
