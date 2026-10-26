import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as utils_default } from "./utils-Baw92-Mr.mjs";
//#region lib/routes/nua/lib.ts
const baseUrl = "https://lib.nua.edu.cn";
const route = {
	path: "/lib/:type",
	categories: ["university"],
	example: "/nua/lib/xwdt",
	parameters: { type: "News Type" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["lib.nua.edu.cn/:type/list.htm"] }],
	name: "Library",
	maintainers: ["evnydd0sf"],
	handler,
	description: `| News Type | Parameters |
| --------- | ---------- |
| 新闻动态  | xwdt       |
| 党建动态  | djdt       |
| 资源动态  | zydt       |
| 服务动态  | fwdt       |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let webPageName;
	switch (type) {
		case "xwdt":
			webPageName = ".wp_column.column-1.selected";
			break;
		case "djdt":
			webPageName = ".wp_column.column-2.selected";
			break;
		case "zydt":
			webPageName = ".wp_column.column-3.selected";
			break;
		case "fwdt":
			webPageName = ".wp_column.column-4.selected";
			break;
		default: throw new InvalidParameterError(`暂不支持对${type}的订阅`);
	}
	const newsUrl = `${baseUrl}/${type}/list.htm`;
	const listName = "div.news_con";
	const artiContent = ".wp_articlecontent";
	const items = await utils_default.ProcessList(newsUrl, baseUrl, listName, ".news_date", webPageName);
	const results = await utils_default.ProcessFeed(items[0], artiContent);
	return {
		title: "NUA-图书馆-" + items[1],
		link: `${baseUrl}/${type}/list.htm`,
		description: "南京艺术学院 图书馆 " + items[1],
		item: results
	};
}
//#endregion
export { route };
