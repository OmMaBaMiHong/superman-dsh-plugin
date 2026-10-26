import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/ss.ts
const route = {
	path: "/ss/:type",
	categories: ["university"],
	example: "/zzu/ss/xwzx",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www5.zzu.edu.cn/ss/"] }],
	name: "郑大社科院",
	maintainers: ["amandus1990"],
	handler,
	description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		xwzx: ["新闻资讯", "https://www5.zzu.edu.cn/ss/index/skxw.htm"],
		tzgg: ["通知公告", "https://www5.zzu.edu.cn/ss/index/tzgg.htm"]
	};
	const $ = load((await got_default(typeDict[type][1])).data);
	const list = $(".list_notice > a").toArray().slice(0, 10).map((element) => {
		const $element = $(element);
		const link = new URL($element.attr("href"), typeDict[type][1]).href;
		const title = $element.find("h3").text().trim();
		const pubDateText = $element.find("time").text().trim();
		let pubDate = null;
		if (pubDateText) if (type === "xwzx") pubDate = `${(/* @__PURE__ */ new Date()).getFullYear()}-${pubDateText}`;
		else pubDate = pubDateText;
		return {
			title,
			link,
			pubDate
		};
	});
	return {
		title: `郑大社科院-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
