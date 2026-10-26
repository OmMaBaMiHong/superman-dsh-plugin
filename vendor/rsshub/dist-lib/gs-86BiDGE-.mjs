import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/gs.ts
const route = {
	path: "/gs/:type",
	categories: ["university"],
	example: "/zzu/gs/xwzx",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gs.zzu.edu.cn/"] }],
	name: "郑大研究生院",
	maintainers: ["amandus1990"],
	handler,
	description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		xwzx: ["新闻资讯", "https://gs.zzu.edu.cn/index/yjsyxw.htm"],
		tzgg: ["通知公告", "https://gs.zzu.edu.cn/index/yjsygg.htm"]
	};
	const $ = load((await got_default(typeDict[type][1])).data);
	const list = $(".r_list ul li").toArray().slice(0, 20).map((element) => {
		const $element = $(element);
		const $link = $element.find("a").first();
		const link = new URL($link.attr("href"), typeDict[type][1]).href;
		return {
			title: $link.text().trim(),
			link,
			pubDate: $element.find("span").text().trim().replaceAll(/[[\]]/g, "") || null
		};
	});
	return {
		title: `郑大研究生院-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
