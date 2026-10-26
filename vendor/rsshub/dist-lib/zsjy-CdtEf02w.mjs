import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sicau/zsjy.ts
const route = {
	path: "/zsjy/:category?",
	categories: ["university"],
	example: "/sicau/zsjy/bkszs",
	parameters: { category: "分类，见下表，默认为本科生招生" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dky.sicau.edu.cn/"] }],
	name: "招生就业",
	maintainers: ["nczitzk"],
	handler,
	url: "dky.sicau.edu.cn/",
	description: `| 本科生招生 | 研究生招生 | 毕业生选录指南 |
| ---------- | ---------- | -------------- |
| bkszs      | yjszs      | bysxlzn        |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "bkszs";
	const rootUrl = "https://dky.sicau.edu.cn";
	const currentUrl = `${rootUrl}/zsjy/${category}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $("a.tit").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			pubDate: parseDate(item.prev().text()),
			link: `${rootUrl}${item.attr("href").replace(/\.\./, "/")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".v_news_content p").slice(0, 2).remove();
		item.description = content(".v_news_content").html();
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
