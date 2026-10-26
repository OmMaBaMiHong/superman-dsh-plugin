import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/2yuan/news.ts
const route = {
	path: "/2yuan/news/:id?",
	categories: ["university"],
	example: "/xjtu/2yuan/news",
	parameters: { id: "编号，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "第二附属医院新闻",
	maintainers: ["nczitzk"],
	handler,
	description: `| 分类     | 编号 |
| -------- | ---- |
| 通知公告 | 110  |
| 综合新闻 | 6    |
| 科室动态 | 8    |
| 教学动态 | 45   |
| 科研动态 | 51   |
| 护理动态 | 57   |
| 党群活动 | 63   |
| 外事活动 | 13   |
| 媒体二院 | 14   |
| 理论政策 | 16   |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "110";
	const rootUrl = "http://2yuan.xjtu.edu.cn";
	const currentUrl = `${rootUrl}/Html/News/Columns/${id}/Index.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".column_list h2").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: `${rootUrl}${item.find("a").attr("href")}`,
			pubDate: timezone(parseDate(item.find(".dy_date").text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content("#zoom").html();
		item.pubDate = timezone(parseDate(content(".sub_tit3 strong").first().text().replace(/发布时间：/, "")), 8);
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
