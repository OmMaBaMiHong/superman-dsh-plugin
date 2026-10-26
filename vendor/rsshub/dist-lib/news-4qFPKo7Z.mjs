import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/hypergryph/arknights/news.ts
const parseList = (list) => list.map((item) => ({
	title: item.title,
	author: item.author,
	description: item.brief.trim().replaceAll("\n", "<br>"),
	link: `https://ak.hypergryph.com/news/${item.cid}`,
	pubDate: parseDate(item.displayTime, "X")
}));
const route = {
	path: "/arknights/news/:group?",
	categories: ["game"],
	example: "/hypergryph/arknights/news",
	parameters: { group: "分组，默认为 `ALL`" },
	radar: [{ source: ["ak-conf.hypergryph.com/news"] }],
	name: "明日方舟 - 游戏公告与新闻",
	maintainers: ["Astrian"],
	handler,
	url: "ak-conf.hypergryph.com/news",
	description: `| 全部 | 最新   | 公告         | 活动     | 新闻 |
| ---- | ------ | ------------ | -------- | ---- |
| ALL  | LATEST | ANNOUNCEMENT | ACTIVITY | NEWS |`
};
async function handler(ctx) {
	const { group = "ALL" } = ctx.req.param();
	const initialData = await cache_default.tryGet("hypergryph:arknights:news", async () => {
		const response = await rofetch("https://ak.hypergryph.com/news");
		const $ = cheerio.load(response);
		const renderData = JSON.parse($("script:contains(\"initialData\")").first().text().match(/self\.__next_f\.push\((.+)\)/)?.[1] ?? "");
		return JSON.parse(renderData[1].slice(2))[3].initialData;
	}, config.cache.routeExpire, false);
	const list = group === "ALL" ? Object.values(initialData).flatMap(({ list }) => parseList(list)) : parseList(initialData[group].list);
	return {
		title: "《明日方舟》游戏公告与新闻",
		link: "https://ak.hypergryph.com/news",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const response = await rofetch(item.link);
			const description = cheerio.load(response)("div > div > div > div > div > div > div:nth-child(4)");
			item.description = description.length ? description.html() : item.description;
			return item;
		}))),
		language: "zh-cn"
	};
}
//#endregion
export { route };
