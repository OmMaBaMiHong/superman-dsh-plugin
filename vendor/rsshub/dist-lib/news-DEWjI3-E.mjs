import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as rootUrl, t as getCookie } from "./utils-DwPSu1in.mjs";
import { load } from "cheerio";
//#region lib/routes/yxdown/news.ts
const route = {
	path: "/news/:category?",
	categories: ["game"],
	example: "/yxdown/news",
	parameters: { category: "分类，见下表，默认为资讯首页" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "资讯",
	maintainers: ["nczitzk"],
	handler,
	description: `| 资讯首页 | 业界动态 | 视频预告 | 新作发布 | 游戏资讯 | 游戏评测 | 网络游戏 | 手机游戏 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
|          | dongtai  | yugao    | xinzuo   | zixun    | pingce   | wangluo  | shouyou  |`
};
async function handler(ctx) {
	const currentUrl = `${rootUrl}/news/${ctx.req.param("category") ? `${ctx.req.param("category")}/` : ""}`;
	const cookie = await getCookie();
	const $ = load((await got_default(currentUrl, { headers: { cookie } })).data);
	const list = $(".div_zixun h2 a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link, { headers: { cookie } })).data);
		content("h1, .intro").remove();
		item.description = content(".news").html();
		item.pubDate = timezone(parseDate(content("meta[property=\"og:release_date\"]").attr("content")), 8);
		return item;
	})));
	return {
		title: `${$(".now").text()} - 游讯网`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
