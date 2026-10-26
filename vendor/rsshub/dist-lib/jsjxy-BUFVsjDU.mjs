import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/stbu/jsjxy.ts
const gbk2utf8 = (s) => iconv.decode(s, "gbk");
const route = {
	path: "/jsjxy",
	categories: ["university"],
	example: "/stbu/jsjxy",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jsjxy.stbu.edu.cn/news", "jsjxy.stbu.edu.cn"] }, { source: ["stbu.edu.cn"] }],
	name: "计算机学院 - 通知公告",
	maintainers: ["HyperCherry"],
	handler,
	url: "jsjxy.stbu.edu.cn/news",
	description: `::: warning
计算机学院通知公告疑似禁止了非大陆 IP 访问，使用路由需要自行 [部署](https://docs.rsshub.app/deploy/)。
:::`
};
async function handler() {
	const baseUrl = "https://jsjxy.stbu.edu.cn/news/";
	const { data: response } = await got_default(baseUrl, { responseType: "buffer" });
	const $ = load(gbk2utf8(response));
	const list = $(".content dl h4").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.text(),
			link: a.attr("href")
		};
	});
	return {
		title: "四川工商学院计算机学院 - 新闻动态",
		link: baseUrl,
		description: "四川工商学院计算机学院 - 新闻动态",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link, { responseType: "buffer" });
			const $ = load(gbk2utf8(response));
			item.description = $(".content14").first().html().trim();
			item.pubDate = timezone(parseDate($(".article .source").text().split("日期：", 2)[1].replace("\n", "").trim()), 8);
			return item;
		})))
	};
}
//#endregion
export { route };
