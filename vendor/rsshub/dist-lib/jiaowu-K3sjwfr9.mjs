import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xaufe/jiaowu.ts
const rootMeta = {
	url: "http://jiaowu.xaufe.edu.cn/",
	title: "西安财经大学 教务处（招生办公室）"
};
const categories = { tzgg: {
	title: "通知公告",
	url: "index/tzgg.htm"
} };
const route = {
	path: "/jiaowu/:category?",
	categories: ["university"],
	example: "/xaufe/jiaowu/tzgg",
	parameters: { category: "分类，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	maintainers: ["shaokeyibb"],
	handler,
	description: `| 通知公告 |
| :------: |
|   tzgg   |`
};
async function handler(ctx) {
	const pCategory = ctx.req.param("category");
	const category = categories[pCategory] || categories.tzgg;
	const response = (await got_default({
		method: "get",
		url: rootMeta.url + category.url
	})).body;
	const $ = load(response);
	const data = $(".main_conRCb ul li").slice(0, 16).toArray().map((item) => {
		item = $(item);
		const pubDate = item.children("span").text();
		const title = item.find("a em").text();
		const link = item.children("a").attr("href").replaceAll("../", () => rootMeta.url);
		return {
			pubDate: parseDate(pubDate),
			title,
			link
		};
	});
	return {
		title: `${category.title}-${rootMeta.title}`,
		link: rootMeta.url + category.url,
		description: `${category.title}-${rootMeta.title}`,
		language: "zh_CN",
		item: await Promise.all(data.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default({
				method: "get",
				url: item.link
			})).body);
			item.author = /作者：(\S*)\s{4}/.exec($("p", ".main_contit").text())[1];
			item.description = $("#vsb_content").html();
			return item;
		})))
	};
}
//#endregion
export { route };
