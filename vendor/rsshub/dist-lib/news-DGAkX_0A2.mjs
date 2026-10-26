import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/qm120/news.ts
const route = {
	path: "/news/:category?",
	categories: ["new-media"],
	example: "/qm120/news",
	parameters: { category: "分类，见下表，默认为健康焦点" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["qm120.com/"] }],
	name: "新闻",
	maintainers: ["nczitzk"],
	handler,
	url: "qm120.com/",
	description: `| 健康焦点 | 行业动态 | 医学前沿 | 法规动态 |
| -------- | -------- | -------- | -------- |
| jdxw     | hydt     | yxqy     | fgdt     |

| 食品安全 | 医疗事故 | 医药会展 | 医药信息 |
| -------- | -------- | -------- | -------- |
| spaq     | ylsg     | yyhz     | yyxx     |

| 新闻专题 | 行业新闻 |
| -------- | -------- |
| zhuanti  | xyxw     |`
};
async function handler(ctx) {
	const currentUrl = `http://www.qm120.com/news/${ctx.req.param("category") ?? "jdxw"}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".lb2boxls ul li a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".neirong_body").html();
		item.pubDate = timezone(parseDate(content(".neirong_head p span").eq(1).text()), 8);
		return item;
	})));
	return {
		title: `${$(".zt_liebiao_tit").text()} - 全民健康网`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
