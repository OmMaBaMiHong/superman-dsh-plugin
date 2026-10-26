import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/xbx.ts
const route = {
	path: "/xbx/:type",
	categories: ["university"],
	example: "/zzu/xbx/xwzx",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www5.zzu.edu.cn/xbx/"] }],
	name: "郑大校长办",
	maintainers: ["amandus1990"],
	handler,
	description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		xwzx: ["新闻资讯", "https://www5.zzu.edu.cn/xbx/index/xwzx.htm"],
		tzgg: ["通知公告", "https://www5.zzu.edu.cn/xbx/index/tzgg.htm"]
	};
	const $ = load((await got_default(typeDict[type][1])).data);
	const list = $(".new_list3 dd").slice(0, 20).toArray().map((element) => {
		const $element = $(element);
		const $link = $element.find("a").first();
		const link = new URL($link.attr("href"), typeDict[type][1]).href;
		return {
			title: $link.attr("title") || $link.text().trim(),
			link,
			pubDate: $element.find("span.fr.gray").text().trim() || null
		};
	});
	return {
		title: `郑大校长办-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
