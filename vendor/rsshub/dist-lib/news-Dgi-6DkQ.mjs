import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/bjfu/news/utils.ts
async function loadContent(link) {
	const data = (await got_default.get(link)).data;
	const $ = load(data);
	const pubDate = timezone(parseDate($(".article").text().match(/\d{4}(?:\/\d{2}){2}/)), 8);
	return {
		description: $(".article_con").html(),
		pubDate,
		title: $("h2").text()
	};
}
const ProcessFeed = (base, list, caches) => Promise.all(list.map((item) => {
	const $title = load(item)("a");
	const itemUrl = new URL($title.attr("href"), base).href;
	return caches.tryGet(itemUrl, async () => {
		const { description, pubDate, title } = await loadContent(itemUrl);
		return {
			title: $title.text().includes("...") ? title : $title.text(),
			link: itemUrl,
			author: "绿色新闻网",
			description,
			pubDate
		};
	});
}));
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/bjfu/news/index.ts
const route = {
	path: "/news/:type",
	categories: ["university"],
	example: "/bjfu/news/lsyw",
	parameters: { type: "新闻栏目" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.bjfu.edu.cn/:type/index.html"] }],
	name: "绿色新闻网",
	maintainers: ["markmingjie"],
	handler,
	description: `| 绿色要闻 | 校园动态 | 教学科研 | 党建思政 | 一周排行 |
| -------- | -------- | -------- | -------- | -------- |
| lsyw     | xydt     | jxky     | djsz     | yzph     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let title, path;
	switch (type) {
		case "xydt":
			title = "校园动态";
			path = "lsxy/";
			break;
		case "jxky":
			title = "教学科研";
			path = "jxky/";
			break;
		case "djsz":
			title = "党建思政";
			path = "djsz/";
			break;
		case "yzph":
			title = "一周排行";
			path = "yzph/";
			break;
		default:
			title = "绿色要闻";
			path = "lsyw/";
	}
	const base = "http://news.bjfu.edu.cn/" + path;
	const data = (await got_default({
		method: "get",
		responseType: "buffer",
		url: base
	})).data;
	let $ = load(iconv.decode(data, "utf-8"));
	const charset = $("meta[http-equiv=\"Content-Type\"]").attr("content").match(/charset=(.*)/)?.[1];
	if (charset?.toLowerCase() !== "utf-8") $ = load(iconv.decode(data, charset ?? "utf-8"));
	const list = $(".news_ul li").slice(0, 12).toArray();
	const result = await utils_default.ProcessFeed(base, list, cache_default);
	return {
		title: "北林新闻- " + title,
		link: "http://news.bjfu.edu.cn/" + path,
		description: "绿色新闻网 - " + title,
		item: result
	};
}
//#endregion
export { route };
