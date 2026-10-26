import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/kjc.ts
const route = {
	path: "/kjc/:type",
	categories: ["university"],
	example: "",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www7.zzu.edu.cn/kjc/"] }],
	name: "郑大科研院",
	maintainers: ["amandus1990"],
	handler,
	description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		xwzx: ["新闻资讯", "https://www7.zzu.edu.cn/kjc/index/kydt.htm"],
		tzgg: ["通知公告", "https://www7.zzu.edu.cn/kjc/index/tzgg.htm"]
	};
	const $ = load((await got_default(typeDict[type][1])).data);
	const list = $(".list_guild").toArray().slice(0, 14).map((element) => {
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
		title: `郑大科研院-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
