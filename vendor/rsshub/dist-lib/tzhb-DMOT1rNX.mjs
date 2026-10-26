import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/tzhb.ts
const route = {
	path: "/tzhb/:type",
	categories: ["university"],
	example: "/zzu/tzhb/gzdt",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www5.zzu.edu.cn/tzhb/"] }],
	name: "郑大党委统战部",
	maintainers: ["amandus1990"],
	handler,
	description: `| 工作动态 | 通知公告 |
| -------- | -------- |
| gzdt     | tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		gzdt: ["工作动态", "https://www5.zzu.edu.cn/tzhb/index/gzdt.htm"],
		tzgg: ["通知公告", "https://www5.zzu.edu.cn/tzhb/index/tzgg1.htm"]
	};
	const $ = load((await got_default(typeDict[type][1])).data);
	const list = $(".main_conR li").toArray().slice(0, 15).map((element) => {
		const $element = $(element);
		const $link = $element.find("a").first();
		const link = new URL($link.attr("href"), typeDict[type][1]).href;
		return {
			title: $link.find("em").text().trim(),
			link,
			pubDate: $element.find("span").text().trim() || null
		};
	});
	return {
		title: `郑大党委统战部-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
