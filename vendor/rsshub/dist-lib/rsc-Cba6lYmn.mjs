import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/rsc.ts
const route = {
	path: "/rsc/:type",
	categories: ["university"],
	example: "/zzu/rsc/rsyw",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www5.zzu.edu.cn/rsc/"] }],
	name: "郑大人事部",
	maintainers: ["amandus1990"],
	handler,
	description: `| 人事要闻 | 通知公告 | 招聘公告 |
| -------- | -------- | -------- |
| rsyw     | tzgg     | zpxx     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		rsyw: ["人事要闻", "https://www5.zzu.edu.cn/rsc/xwgg1/rsyw.htm"],
		tzgg: ["通知公告", "https://www5.zzu.edu.cn/rsc/xwgg1/tzgg.htm"],
		zpxx: ["招聘公告", "https://www5.zzu.edu.cn/rsc/index/zpxx.htm"]
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
		title: `郑大人事部-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
