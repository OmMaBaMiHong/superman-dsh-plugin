import { t as utils_default } from "./utils-Baw92-Mr.mjs";
//#region lib/routes/nua/sxw.ts
const route = {
	path: "/sxw/:type",
	categories: ["university"],
	example: "/nua/sxw/230",
	parameters: { type: "News Type" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sxw.nua.edu.cn/:type/list.htm"] }],
	name: "Shuangxing Information",
	maintainers: ["evnydd0sf"],
	handler,
	description: `| News Type | Parameters |
| --------- | ---------- |
| 校园电视  | 230        |
| 院部动态  | 232        |
| 动感校园  | 233        |
| 招就指南  | 234        |
| 南艺院报  | 236        |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const baseUrl = "https://sxw.nua.edu.cn";
	const newsUrl = `${baseUrl}/${type}/list.htm`;
	const listName = "li.list_item";
	const listDate = ".Article_PublishDate";
	const webPageName = ".Column_Anchor";
	const artiContent = ".read";
	const items = await utils_default.ProcessList(newsUrl, baseUrl, listName, listDate, webPageName);
	const results = await utils_default.ProcessFeed(items[0], artiContent);
	return {
		title: "NUA-双馨网-" + items[1],
		link: newsUrl,
		description: "南京艺术学院 双馨网 " + items[1],
		item: results
	};
}
//#endregion
export { route };
