import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as getContent } from "./utils-BkVbBR3v.mjs";
import { load } from "cheerio";
//#region lib/routes/njust/gs.ts
const host = "https://gs.njust.edu.cn";
const route = {
	path: "/gs/:type?",
	categories: ["university"],
	example: "/njust/gs/sytzgg_4568",
	parameters: { type: "分类 ID，部分示例参数见下表，默认为首页通知公告，其他分类 ID 可以从网站 URL Path 中找到，如国际交流为 `gjjl`" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["gs.njust.edu.cn/:type/list.htm"],
		target: "/gs/:type"
	}],
	name: "研究生院",
	maintainers: ["MilkShakeYoung", "jasongzy"],
	handler,
	description: `| 首页通知公告 | 首页新闻动态 | 最新通知 | 招生信息 | 培养信息 | 学术活动 |
| ------------ | ------------ | -------- | -------- | -------- | -------- |
| sytzgg\\_4568 | sytzgg       | 14686    | 14687    | 14688    | xshdggl  |`
};
async function handler(ctx) {
	const id = "/" + (ctx.req.param("type") ?? "sytzgg_4568");
	const siteUrl = host + id + "/list.htm";
	const $ = load(await getContent(siteUrl));
	const title = "南京理工大学研究生院 -- " + $("title").text();
	const list = $("ul.news_ul").find("li");
	return {
		title,
		link: siteUrl,
		item: await Promise.all(list.map(async (index, item) => {
			const url = $(item).find("a").attr("href");
			let desc = "";
			if (url.startsWith("/")) desc = load(await getContent(host + url))(".wp_articlecontent").html();
			return {
				title: $(item).find("a").attr("title").trim(),
				description: desc,
				pubDate: timezone(parseDate($(item).find("span").text(), "YYYY-MM-DD"), 8),
				link: url
			};
		}))
	};
}
//#endregion
export { route };
