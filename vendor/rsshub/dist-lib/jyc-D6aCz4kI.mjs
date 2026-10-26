import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/xupt/jyc.ts
const route = {
	path: "/jyc/:type?",
	categories: ["university"],
	example: "/xupt/jyc",
	parameters: { type: "分类，默认为 tzgg（通知公告）" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jyc.xupt.edu.cn/index/tzgg.htm"],
		target: "/jyc/tzgg"
	}],
	name: "教务处通知公告",
	maintainers: ["StudyingLover"],
	handler,
	description: `| 分类     | 参数 |
| -------- | ---- |
| 通知公告 | tzgg |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "tzgg";
	const typeDict = { tzgg: ["通知公告", "https://jyc.xupt.edu.cn/index/tzgg.htm"] };
	const [typeName, url] = typeDict[type] || typeDict.tzgg;
	const $ = load(await rofetch(url));
	const list = $(".ej_list li").toArray().map((item) => {
		const $link = $(item).find("a").first();
		const linkHref = $link.attr("href") || "";
		const absoluteLink = new URL(linkHref, "https://jyc.xupt.edu.cn").href;
		return {
			title: $link.text().trim(),
			link: absoluteLink
		};
	}).filter((item) => item.title && item.link);
	return {
		title: `西安邮电大学教务处 - ${typeName}`,
		link: url,
		item: list
	};
}
//#endregion
export { route };
