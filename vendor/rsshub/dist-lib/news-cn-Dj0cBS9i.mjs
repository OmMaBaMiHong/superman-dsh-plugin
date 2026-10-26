import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/blizzard/news-cn.ts
const route = {
	path: "/news-cn/:category?",
	categories: ["game"],
	example: "/blizzard/news-cn/ow",
	parameters: { category: "游戏类别, 默认为 ow" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["ow.blizzard.cn"],
			target: "/news-cn/"
		},
		{
			source: ["wow.blizzard.cn"],
			target: "/news-cn/"
		},
		{
			source: ["hs.blizzard.cn"],
			target: "/news-cn/"
		}
	],
	name: "暴雪游戏国服新闻",
	maintainers: ["zhangpeng2k"],
	description: `| 守望先锋 | 炉石传说 | 魔兽世界 |
| -------- | -------- | -------- |
| ow       | hs       | wow      |`,
	handler
};
const categoryNames = {
	ow: "守望先锋",
	hs: "炉石传说",
	wow: "魔兽世界"
};
const parsers = {
	ow: ($) => $(".list-data-container .list-item-container").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".content-title").text(),
			link: item.find(".fill-link").attr("href"),
			description: item.find(".content-intro").text(),
			pubDate: parseDate(item.find(".content-date").text()),
			image: item.find(".item-pic").attr("src")
		};
	}),
	hs: ($) => $(".article-container>a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".title").text(),
			link: item.attr("href"),
			description: item.find(".desc").text(),
			pubDate: parseDate(item.find(".date").attr("data-time")),
			image: item.find(".article-img img").attr("src")
		};
	}),
	wow: ($) => $(".Pane-list>a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".list-title").text(),
			link: item.attr("href"),
			description: item.find(".list-desc").text(),
			pubDate: parseDate(item.find(".list-time").attr("data-time")),
			image: item.find(".img-box img").attr("src")
		};
	})
};
const detailParsers = {
	ow: ($) => $(".deatil-content").first().html(),
	hs: ($) => $(".article").first().html(),
	wow: ($) => $(".detail").first().html()
};
function getList(category, $) {
	return Object.hasOwn(parsers, category) ? parsers[category]($) : [];
}
async function fetchDetail(item, category) {
	return await cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		const parseDetail = detailParsers[category];
		item.description = parseDetail($);
		return item;
	});
}
async function handler(ctx) {
	const category = ctx.req.param("category") || "ow";
	if (!Object.hasOwn(categoryNames, category)) throw new Error("Invalid category");
	const rootUrl = `https://${category}.blizzard.cn/news`;
	const list = getList(category, load(await rofetch(rootUrl)));
	if (!list.length) throw new Error("No news found");
	const items = await Promise.all(list.map((item) => fetchDetail(item, category)));
	return {
		title: `${categoryNames[category]}新闻`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
