import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/auto-stats/index.ts
const route = {
	path: "/:category?",
	categories: ["other"],
	example: "/auto-stats",
	parameters: { category: "分类，见下表，默认为信息快递" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 信息快递 | 工作动态 | 专题分析 |
| -------- | -------- | -------- |
| xxkd     | gzdt     | ztfx     |`
};
async function handler(ctx) {
	const { category = "xxkd" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "http://www.auto-stats.org.cn";
	const currentUrl = new URL(`${category}.asp`, rootUrl).href;
	const { data: response } = await got_default(currentUrl, { responseType: "buffer" });
	const $ = load(iconv.decode(response, "gbk"));
	let items = $("a.dnews font").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const title = item.text();
		const pubDate = title.match(/(\d{4}(?:\/\d{1,2}){2}\s\d{1,2}(?::\d{2}){2})/)?.[1] ?? void 0;
		return {
			title: title.replace(/●/, "").split(/（\d+/, 1)[0],
			link: new URL(item.parent().prop("href"), rootUrl).href,
			pubDate: timezone(parseDate(pubDate, "YYYY/M/D H:mm:ss"), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link, { responseType: "buffer" });
		item.description = load(iconv.decode(detailResponse, "gbk"))("table tbody tr td.dd").last().html();
		return item;
	})));
	const subtitle = $("title").text().split(/——/).pop();
	const image = new URL("images/logo.jpg", rootUrl).href;
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: subtitle,
		language: "zh",
		image,
		subtitle,
		allowEmpty: true
	};
}
//#endregion
export { route };
