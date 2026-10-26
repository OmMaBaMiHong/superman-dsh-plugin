import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/thecover/channel.ts
const rootUrl = "https://www.thecover.cn";
const nodes = {
	3892: "天下",
	3560: "四川",
	3909: "辟谣",
	3686: "国际",
	11: "云招考",
	3902: "30秒",
	3889: "拍客",
	3689: "体育",
	1: "国内",
	4002: "帮扶铁军",
	12: "文娱",
	46: "宽窄",
	4: "商业",
	21: "千面",
	17: "封面号"
};
const route = {
	path: "/channel/:id?",
	categories: ["new-media"],
	example: "/thecover/channel/3560",
	parameters: { id: "对应id,可在频道链接中获取，默认为3892" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "频道",
	maintainers: ["yuxinliu-alex"],
	handler,
	description: `| 天下 | 四川 | 辟谣 | 国际 | 云招考 | 30 秒 | 拍客 | 体育 | 国内 | 帮扶铁军 | 文娱 | 宽窄 | 商业 | 千面 | 封面号 |
| ---- | ---- | ---- | ---- | ------ | ----- | ---- | ---- | ---- | -------- | ---- | ---- | ---- | ---- | ------ |
| 3892 | 3560 | 3909 | 3686 | 11     | 3902  | 3889 | 3689 | 1    | 4002     | 12   | 46   | 4    | 21   | 17     |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "3892";
	const targetUrl = `https://www.thecover.cn/channel_${id}`;
	const $ = load((await got_default({
		method: "get",
		url: targetUrl
	})).data);
	const list = $("a.link-to-article").toArray().filter((item) => $(item).attr("href").startsWith("/")).map((item) => ({ link: rootUrl + $(item).attr("href") }));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content("h1", ".main-article").text();
		item.description = content("section.article-content").html();
		const info = content("span", ".props-of-title");
		item.author = info.eq(0).text();
		item.pubDate = timezone(parseDate(info.eq(1).text(), "YYYY-MM-DD HH:mm"), 8);
		return item;
	})));
	return {
		title: `${nodes[id]}-封面新闻`,
		link: targetUrl,
		description: "封面新闻作为华西都市报深度融合转型和打造新型主流媒体的载体，牢固确立移动优先战略，创新移动新闻产品，打造移动传播矩阵，封面新闻的传播力、引导力、影响力和公信力不断得到各方肯定。封面新闻突破千万的用户下载量，呈现出以四川为主阵地的全国分布态势，用户年龄构成以20-35岁为主，“亿万年轻人的生活方式”的定位初步得到体现。",
		language: "zh-cn",
		item: items
	};
}
//#endregion
export { route };
