import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/scc/recruit.ts
const arr = {
	xwrd: "home!newsHome.action?category=12",
	tzgg: "home!newsHome.action?category=13",
	zpxx: "home!recruit.action?category=1&jobType=110001",
	sxxx: "home!recruitList.action?category=2&jobType=110001",
	cyxx: "home!newsHome.action?category=11"
};
const baseUrl = "https://scc.pku.edu.cn/";
const route = {
	path: "/scc/recruit/:type?",
	categories: ["university"],
	example: "/pku/scc/recruit/zpxx",
	parameters: { type: "分区，见下表，默认请求 `zpxx`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "学生就业指导服务中心",
	maintainers: ["DylanXie123"],
	handler,
	description: `| xwrd     | tzgg     | zpxx     | sxxx     | cyxx     |
| -------- | -------- | -------- | -------- | -------- |
| 新闻热点 | 通知公告 | 招聘信息 | 实习信息 | 创业信息 |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "zpxx";
	const rootUrl = baseUrl + arr[type];
	const $ = load((await got_default(rootUrl)).data);
	const feed_title = $("h2.category").text();
	const sorted = $("div#articleList-body div.item.clearfix").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const date = parseDate(item.find("div.item-date").text());
		return {
			title: a.text(),
			link: new URL(a.attr("href"), baseUrl).href,
			pubDate: date
		};
	}).toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime()).slice(0, 10);
	return {
		title: `北京大学学生就业指导服务中心 - ${feed_title}`,
		link: rootUrl,
		item: await Promise.all(sorted.map((item) => cache_default.tryGet(item.link, async () => {
			const script = load((await got_default(item.link)).data)("div#content-div script").html();
			if (script !== null) {
				const content_route = script.match(/\$\("#content-div"\).load\("(\S+)"\)/)[1];
				item.description = (await got_default(new URL(content_route, baseUrl).href)).data;
			}
			return item;
		})))
	};
}
//#endregion
export { route };
