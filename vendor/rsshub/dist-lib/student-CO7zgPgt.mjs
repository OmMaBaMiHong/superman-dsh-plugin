import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zzu/student.ts
const route = {
	path: "/student/:type",
	categories: ["university"],
	example: "/zzu/student/xwzx",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www5.zzu.edu.cn/student/"] }],
	name: "郑大学生处",
	maintainers: ["amandus1990"],
	handler,
	description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| xwzx     | tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const typeDict = {
		xwzx: ["新闻资讯", "https://www5.zzu.edu.cn/student/xwzx.htm"],
		tzgg: ["通知公告", "https://www5.zzu.edu.cn/student/tzgg.htm"]
	};
	const $ = load((await got_default(typeDict[type][1])).data);
	const list = $(".part-list ul li").toArray().slice(0, 10).map((element) => {
		const $element = $(element);
		const $link = $element.find("a").first();
		const link = new URL($link.attr("href"), typeDict[type][1]).href;
		const title = $link.find("span").text().trim();
		const pubDateText = $element.find("em").text().trim();
		let pubDate = null;
		if (pubDateText) {
			const match = pubDateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
			if (match) pubDate = `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
		}
		return {
			title,
			link,
			pubDate
		};
	});
	return {
		title: `郑大学生处-${typeDict[type][0]}`,
		link: typeDict[type][1],
		item: list
	};
}
//#endregion
export { route };
