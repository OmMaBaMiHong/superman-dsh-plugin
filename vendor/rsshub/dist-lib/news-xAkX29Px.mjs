import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/neu/news.ts
const baseUrl = "https://neunews.neu.edu.cn";
const route = {
	path: "/news/:type",
	categories: ["university"],
	example: "/neu/news/ddyw",
	parameters: { type: "种类名，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["neunews.neu.edu.cn/:type/list.htm"] }],
	name: "新闻网",
	maintainers: ["JeasonLau"],
	handler,
	description: `| 种类名   | 参数 |
| -------- | ---- |
| 东大要闻 | ddyw |
| 媒体东大 | mtdd |
| 通知公告 | tzgg |
| 新闻纵横 | xwzh |
| 人才培养 | rcpy |
| 学术科研 | xsky |
| 英文新闻 | 217  |
| 招生就业 | zsjy |
| 考研出国 | kycg |
| 校园文学 | xywx |
| 校友风采 | xyfc |
| 时事热点 | ssrd |
| 教育前沿 | jyqy |
| 文化体育 | whty |
| 最新科技 | zxkj |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const newsUrl = `${baseUrl}/${type}/list.htm`;
	const data = (await got_default(newsUrl)).data;
	const $ = load(data);
	const items = $(".column-news-list > .news_list > .news").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: new URL(item.find("a").attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".news_meta").text(), "YYYY-MM-DD")
		};
	});
	const results = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.author = $(".arti-metas").text().split("更新日期", 1)[0];
		item.description = $(".article_content").html();
		return item;
	})));
	return {
		title: `东北大学新闻网-${$("head title").text()}`,
		link: newsUrl,
		item: results
	};
}
//#endregion
export { route };
