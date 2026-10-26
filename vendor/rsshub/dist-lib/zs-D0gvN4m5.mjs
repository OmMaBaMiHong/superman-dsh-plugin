import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dhu/yjs/zs.ts
const baseUrl = "https://yjszs.dhu.edu.cn";
const map = {
	doctor: "/7126/list.htm",
	master: "/7128/list.htm"
};
const route = {
	path: "/yjs/zs/:type?",
	categories: ["university"],
	example: "/dhu/yjs/zs/master",
	parameters: { type: "默认为 `master`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生招生信息",
	maintainers: ["fox2049"],
	handler,
	description: `| 博士招生 | 硕士招生 |
| -------- | -------- |
| doctor   | master   |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "master";
	const link = `${baseUrl}${map[type]}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".list_item").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.attr("title"),
			link: `${baseUrl}${a.attr("href")}`,
			pubDate: parseDate(item.find(".Article_PublishDate").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)(".wp_articlecontent").first().html();
		return item;
	})));
	return {
		title: "东华大学研究生-" + $(".col_title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };
