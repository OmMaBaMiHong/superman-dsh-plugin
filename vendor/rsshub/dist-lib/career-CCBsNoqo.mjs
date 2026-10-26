import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zju/career/index.ts
const rootUrl = "http://www.career.zju.edu.cn";
const host = "http://www.career.zju.edu.cn/jyxt/jygz/new/getContent.zf?minCount=0&maxCount=10&";
const map = /* @__PURE__ */ new Map([
	[1, {
		title: "浙大就业服务平台 -- 新闻动态",
		id: "lmjdid=739BEBB72A072B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2"
	}],
	[2, {
		title: "浙大就业服务平台 -- 活动通知",
		id: "lmjdid=739BEBB72A0B2B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2"
	}],
	[3, {
		title: "浙大就业服务平台 -- 学院动态",
		id: "lmjdid=739BEBB72A0C2B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2"
	}],
	[4, {
		title: "浙大就业服务平台 -- 告示通告",
		id: "lmjdid=739BEBB72A252B25E0538713470A6C41&sjlmid=undefined&lmtype=2&lx=2"
	}]
]);
const route = {
	path: "/career/:type",
	categories: ["university"],
	example: "/zju/career/1",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "就业服务平台",
	maintainers: ["Caicailiushui"],
	handler,
	description: `| 新闻动态 | 活动通知 | 学院通知 | 告示通知 |
| -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        |`
};
async function handler(ctx) {
	const type = Number.parseInt(ctx.req.param("type"));
	const id = map.get(type).id;
	const $ = load((await got_default(`${host}${id}`)).data);
	const items = $(".com-list li").toArray().map((item) => {
		item = $(item);
		const link = item.find("a").eq(0);
		return {
			title: item.find("span").eq(0).attr("title"),
			pubDate: parseDate(item.find(".news-time").text()),
			link: link.attr("href").startsWith("http") ? link.attr("href") : `${rootUrl}/jyxt${link.attr("data-src")}xwid=${link.attr("data-xwid")}&lmtype=${link.attr("data-lmtype")}`
		};
	});
	return {
		title: map.get(type).title,
		link: `${host}${id}`,
		item: items
	};
}
//#endregion
export { route };
