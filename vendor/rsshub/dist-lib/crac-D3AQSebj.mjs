import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/crac/index.ts
const route = {
	path: "/:type?",
	categories: ["government"],
	example: "/crac/2",
	parameters: { type: "类型，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新资讯",
	maintainers: ["Misaka13514"],
	handler,
	description: `| 新闻动态 | 通知公告 | 政策法规 | 常见问题 | 资料下载 | English | 业余中继台 | 科普专栏 |
| -------- | -------- | -------- | -------- | -------- | ------- | ---------- | -------- |
| 1        | 2        | 3        | 5        | 6        | 7       | 8          | 9        |`,
	radar: [{ source: ["www.crac.org.cn/News/*"] }]
};
async function handler(ctx) {
	const baseUrl = "http://www.crac.org.cn";
	const type = ctx.req.param("type");
	const link = type ? `${baseUrl}/News/List?type=${type}` : `${baseUrl}/News/List`;
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const list = $("div.InCont_r_d_cont > li").toArray().map((item) => {
		item = $(item);
		return {
			link: new URL(item.find("a").attr("href"), baseUrl).href,
			pubDate: parseDate(item.find("span.cont_d").text(), "YYYY-MM-DD")
		};
	});
	await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content("div.r_d_cont_title > h3").text();
		item.description = content("div.r_d_cont").html().trim().replaceAll("\n", "");
		return item;
	})));
	return {
		title: $("title").text(),
		link,
		item: list
	};
}
//#endregion
export { route };
