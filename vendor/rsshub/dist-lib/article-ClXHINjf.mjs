import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseItem, r as parseList } from "./utils-CBXvwNQG.mjs";
import { load } from "cheerio";
//#region lib/routes/indienova/article.ts
const route = {
	path: "/:type",
	categories: ["game"],
	example: "/indienova/article",
	parameters: { type: "类型: `article` 文章，`development` 开发" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章",
	maintainers: ["GensouSakuya", "kt286"],
	handler
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let link = "https://indienova.com/indie-game-news/";
	if (type === "development") link = "https://indienova.com/indie-game-development/";
	const $ = load((await got_default(link)).data);
	const list = parseList($);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => parseItem(item))));
	return {
		title: $("head title").text(),
		link,
		description: "独立游戏资讯 | indienova 独立游戏",
		item: items
	};
}
//#endregion
export { route };
