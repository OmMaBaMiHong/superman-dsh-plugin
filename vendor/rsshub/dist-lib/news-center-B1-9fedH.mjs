import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as parseArticle } from "./utils-CJfR1FLc.mjs";
import { load } from "cheerio";
//#region lib/routes/3dmgame/news-center.ts
const route = {
	path: "/news/:category?",
	categories: ["game"],
	example: "/3dmgame/news",
	parameters: { category: "分类名或 ID，见下表，默认为新闻推荐，ID 可从分类 URL 中找到，如 Steam 为 `22221`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["3dmgame.com/news/:category?", "3dmgame.com/news"] }],
	name: "新闻中心",
	maintainers: ["zhboner", "lyqluis"],
	handler,
	description: `| 新闻推荐 | 游戏新闻 | 动漫影视 | 智能数码 | 时事焦点    |
| -------- | -------- | -------- | -------- | ----------- |
|          | game     | acg      | next     | news\\_36\\_1 |`
};
async function handler(ctx) {
	const { category = "" } = ctx.req.param();
	const isArcPost = category && !Number.isNaN(Number(category));
	const url = `https://www.3dmgame.com/${category === "news_36_1" ? category : "news/" + category}`;
	const $ = load((await got_default(url)).data);
	const list = $(isArcPost ? ".selectarcpost" : ".selectpost").toArray().map((item) => {
		item = $(item);
		if (isArcPost) return {
			title: item.find(".bt").text(),
			link: item.attr("href"),
			description: item.find("p").text(),
			pubDate: timezone(parseDate(item.find(".time").text().trim()), 8)
		};
		const a = item.find(".text a");
		return {
			title: a.first().text(),
			link: a.attr("href"),
			description: item.find(".miaoshu").text(),
			pubDate: timezone(parseDate(item.find(".time").text().trim()), 8)
		};
	});
	const out = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: "3DM - " + $("title").text().split("_", 1)[0],
		description: $("meta[name=\"Description\"]").attr("content"),
		link: url,
		item: out
	};
}
//#endregion
export { route };
