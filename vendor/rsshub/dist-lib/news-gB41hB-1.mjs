import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/nrta/news.ts
const categories = {
	112: "总局要闻",
	113: "公告公示",
	114: "工作动态"
};
const route = {
	path: "/news/:category?",
	categories: ["government"],
	example: "/gov/nrta/news",
	parameters: { category: "资讯类别，可从地址中获取，默认为总局要闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["yuxinliu-alex"],
	handler,
	description: `| 总局要闻 | 公告公示 | 工作动态 | 其他 |
| -------- | -------- | -------- | ---- |
| 112      | 113      | 114      |      |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? 112;
	const $ = load((await got_default({
		method: "get",
		url: `http://www.nrta.gov.cn/col/col${category}/index.html`
	})).data.replaceAll(/<!\[cdata\[([\s\S]*?)\]\]>(?=\s*<)/gi, "$1"), { xmlMode: true });
	const list = $("a", "record").toArray().map((item) => {
		item = $(item);
		return { link: item.attr("href") };
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content("td[id=\"artTitMob\"]").text();
		item.description = content("div[id=\"c\"]").html();
		item.pubDate = timezone(parseDate(content(".mobile_time.shareWarpTime").text().trim()), 8);
		item.author = content(".mobile_time.shareFromz").text();
		return item;
	})));
	return {
		title: Object.hasOwn(categories, category) ? categories[category] : "其他",
		link: `http://www.nrta.gov.cn/col/col${category}/index.html`,
		description: "国家广播电视总局",
		language: "zh-cn",
		item: items
	};
}
//#endregion
export { route };
