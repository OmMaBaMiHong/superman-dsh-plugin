import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sicau/dky.ts
const route = {
	path: "/dky/:category?",
	categories: ["university"],
	example: "/sicau/dky/tzgg",
	parameters: { category: "分类，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dky.sicau.edu.cn/"] }],
	name: "动物科技学院",
	maintainers: ["nczitzk"],
	handler,
	url: "dky.sicau.edu.cn/",
	description: `| 通知公告 | 学院动态 | 教学管理 | 动科大讲堂 | 就业信息 |
| -------- | -------- | -------- | ---------- | -------- |
| tzgg     | xydt     | jxgl     | dkdjt      | zpxx     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "tzgg";
	const rootUrl = "https://dky.sicau.edu.cn";
	const currentUrl = `${rootUrl}/${category}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $("a.tit").slice(0, 10).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}/${item.attr("href")}`,
			pubDate: timezone(parseDate(item.prev().text(), "YYYY-MM-DD"), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".v_news_content").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
