import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sicau/yan.ts
const route = {
	path: "/yan/:category?",
	categories: ["university"],
	example: "/sicau/yan/xwgg",
	parameters: { category: "分类，见下表，默认为新闻公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yan.sicau.edu.cn/"] }],
	name: "研究生院",
	maintainers: ["nczitzk"],
	handler,
	url: "yan.sicau.edu.cn/",
	description: `| 新闻公告 | 学术报告 |
| -------- | -------- |
| xwgg     | xsbg     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "xwgg";
	const rootUrl = "https://yan.sicau.edu.cn";
	const currentUrl = `${rootUrl}/index/${category}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".list-4 a[title]").slice(0, 10).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href").replace(/\.\./, "/")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		item.description = load(detailResponse.data)(".v_news_content").html();
		item.pubDate = timezone(parseDate(detailResponse.data.match(/发布时间: (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)[1], "YYYY-MM-DD HH:mm:ss"), 8);
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
