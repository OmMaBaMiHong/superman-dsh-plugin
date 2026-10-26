import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/tgbus/utils.ts
const parseArticle = (item) => cache_default.tryGet(item.link, async () => {
	const { data: response } = await got_default(item.link);
	const $ = load(response);
	const infoBox = $("div.info-box");
	item.author = infoBox.find("b:nth-child(4)").text().trim();
	item.pubDate = timezone(parseDate(infoBox.find("i:last-child").text()), 8);
	item.description = $(".article-main-contentraw").html();
	return item;
});
//#endregion
//#region lib/routes/tgbus/list.ts
const categories = {
	news: "最新资讯",
	review: "游戏评测",
	video: "游戏视频",
	special: "巴士首页特稿",
	hardware: "硬件资讯"
};
const route = {
	path: "/list/:category",
	parameters: { category: "列表分类，见下表" },
	categories: ["game"],
	example: "/tgbus/list/news",
	radar: [{
		source: ["www.tgbus.com/list/:category/"],
		target: "/list/:category"
	}],
	name: "文章列表",
	maintainers: ["Xzonn"],
	handler,
	description: `| 最新资讯 | 游戏评测 | 游戏视频 | 巴士首页特稿 | 硬件资讯 |
| -------- | -------- | -------- | ------------ | -------- |
| news     | review   | video    | special      | hardware |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const listUrl = `https://www.tgbus.com/list/${category}/`;
	const $ = load((await got_default(listUrl)).data);
	const list = $("div.special-infocard").toArray().map((item) => {
		const element = $(item);
		const a = element.find("a");
		return {
			title: element.find("div.title").text(),
			link: `https://www.tgbus.com${a.attr("href")}`,
			description: element.find("div.content").text(),
			pubDate: timezone(parseDate(element.find("div.info span:nth-child(3)").text().trim()), 8)
		};
	});
	const out = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: `${categories[category]} - 电玩巴士`,
		description: $("meta[name=\"description\"]").attr("content"),
		link: listUrl,
		item: out
	};
}
//#endregion
export { route };
