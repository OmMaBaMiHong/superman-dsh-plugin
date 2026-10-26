import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bjwxdxh/index.ts
const route = {
	path: "/:type?",
	categories: ["government"],
	example: "/bjwxdxh/114",
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
	description: `| 协会活动 | 公告通知 | 会议情况 | 简报 | 政策法规 | 学习园地 | 业余无线电服务中心 | 经验交流 | 新技术推介 | 活动通知 | 爱好者园地 | 结果查询 | 资料下载 | 会员之家 | 会员简介 | 会员风采 | 活动报道 |
| -------- | -------- | -------- | ---- | -------- | -------- | ------------------ | -------- | ---------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 86       | 99       | 102      | 103  | 106      | 107      | 108                | 111      | 112        | 114      | 115        | 116      | 118      | 119      | 120      | 121      | 122      |`
};
async function handler(ctx) {
	const baseUrl = "http://www.bjwxdxh.org.cn";
	const type = ctx.req.param("type");
	const link = type ? `${baseUrl}/news/class/?${type}.html` : `${baseUrl}/news/class/`;
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const list = $("div#newsquery > ul > li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("div.title > a").text(),
			link: new URL(item.find("div.title > a").attr("href"), baseUrl).href
		};
	});
	await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const info = content("div.info").text().match(/作者：(\S*)\s+发布于：(\S*\s+.*?)\s/);
		item.author = info[1];
		item.pubDate = timezone(parseDate(info[2], "YYYY-MM-DD HH:mm:ss"), 8);
		item.description = content("div#con").html().trim().replaceAll("\n", "");
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
