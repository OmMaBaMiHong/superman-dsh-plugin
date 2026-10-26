import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/zcycwb.ts
const route = {
	path: "/zcycwb/:type",
	categories: ["university"],
	example: "/zzu/zcycwb/xwzx",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www5.zzu.edu.cn/zcycwb/"] }],
	name: "郑大资产与财务部",
	maintainers: ["amandus1990"],
	handler,
	description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		xwzx: ["新闻资讯", "https://www5.zzu.edu.cn/zcycwb/xwdt.htm"],
		tzgg: ["通知公告", "https://www5.zzu.edu.cn/zcycwb/tzgg.htm"]
	};
	const $ = load((await got_default(typeDict[type][1])).data);
	const list = $(".list ul li").slice(0, 15).toArray().map((element) => {
		const $element = $(element);
		const $link = $element.find("a").first();
		const link = new URL($link.attr("href"), typeDict[type][1]).href;
		return {
			title: $link.attr("title") || $link.text().trim(),
			link,
			pubDate: $element.find("i").text().trim().replaceAll(/[[\]]/g, "") || null
		};
	});
	return {
		title: `郑大资产与财务部-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
