import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/shmtu/www.ts
const host = "https://www.shmtu.edu.cn";
async function loadContent(link) {
	return load((await got_default(link)).data)("article").html();
}
const ProcessFeed = (list, caches) => Promise.all(list.map((item) => caches.tryGet(item.link, async () => {
	item.description = await loadContent(item.link);
	return item;
})));
const route = {
	path: "/www/:type",
	categories: ["university"],
	example: "/shmtu/www/events",
	parameters: { type: "类型名称" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.shmtu.edu.cn/:type"] }],
	name: "官网信息",
	maintainers: ["imbytecat", "simonsmh"],
	handler,
	description: `| 学术讲座 | 通知公告 |
| -------- | -------- |
| events   | notes    |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const info = type === "notes" ? "通知公告" : "学术讲座";
	const $ = load((await got_default(`${host}/${type}`, { headers: { Referer: host } })).data);
	const list = $("tbody tr").toArray().map((item) => {
		item = $(item);
		const category = item.find(".department").text().trim();
		return {
			title: item.find(".title a").text().trim(),
			link: new URL(item.find("a").attr("href"), host).href,
			pubDate: parseDate(item.find(".date-display-single").attr("content")),
			category,
			author: category
		};
	});
	const result = await ProcessFeed(list, cache_default);
	return {
		title: `上海海事大学 ${info}`,
		link: `${host}/${type}`,
		description: "上海海事大学 官网信息",
		item: result
	};
}
//#endregion
export { route };
