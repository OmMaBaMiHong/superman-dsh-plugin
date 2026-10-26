import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/math.ts
const route = {
	path: "/math/:type",
	categories: ["university"],
	example: "/zzu/math/xyxw",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www5.zzu.edu.cn/math/"] }],
	name: "郑大数学与统计学院",
	maintainers: ["amandus1990"],
	handler,
	description: `| 学院新闻 | 通知公告 | 党工团学 | 学术报告 |
| -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | dgtx     | xsbg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		xyxw: ["学院新闻", "https://www5.zzu.edu.cn/math/index/xyxw.htm"],
		tzgg: ["通知公告", "https://www5.zzu.edu.cn/math/index/tzgg.htm"],
		dgtx: ["党工团学", "https://www5.zzu.edu.cn/math/index/dgtx.htm"],
		xsbg: ["学术报告", "https://www5.zzu.edu.cn/math/index/xsbg.htm"]
	};
	const $ = load((await got_default(typeDict[type][1])).data);
	const list = $(".text-list ul li").toArray().slice(0, 16).map((element) => {
		const $element = $(element);
		const $link = $element.find("a").first();
		const link = new URL($link.attr("href"), typeDict[type][1]).href;
		return {
			title: $link.attr("title") || $link.text().trim(),
			link,
			pubDate: $element.find("span").text().trim() || null
		};
	});
	return {
		title: `郑大数学与统计学院-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
