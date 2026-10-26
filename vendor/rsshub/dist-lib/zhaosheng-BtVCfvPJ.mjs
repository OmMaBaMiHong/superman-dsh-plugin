import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sdust/yjsy/zhaosheng.ts
const route = {
	path: "/yjsy/zhaosheng/:id?",
	categories: ["university"],
	example: "/sdust/yjsy/zhaosheng",
	parameters: { id: "栏目 id，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生招生网",
	maintainers: ["nczitzk"],
	handler,
	description: `栏目

| 招生简章 | 专业目录 | 往届录取 | 管理规定 | 资料下载 |
| -------- | -------- | -------- | -------- | -------- |
| zsjz     | zyml     | wjlq     | glgd     | zlxz     |

| 通知公告 | 博士招生 | 硕士招生 | 推免生招生 | 招生宣传 |
| -------- | -------- | -------- | ---------- | -------- |
| tzgg     | bszs     | sszs     | tms        | zsxc     |`
};
async function handler(ctx) {
	const currentUrl = `https://yjsy.sdust.edu.cn/zhaosheng/${ctx.req.param("id") ?? "tzgg"}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".pageUl ul li a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("title"),
			link: new URL(item.attr("href"), currentUrl).href,
			pubDate: parseDate(item.find("span").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".txt, .v_news_content").html();
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
