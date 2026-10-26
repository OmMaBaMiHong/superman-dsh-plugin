import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as fetchArticle } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/whu/swrh.ts
const baseUrl = "https://swrh.whu.edu.cn";
const route = {
	path: "/swrh/:type",
	categories: ["university"],
	example: "/whu/swrh/2",
	radar: [{
		source: ["swrh.whu.edu.cn/:type"],
		target: "/swrh/:type"
	}],
	parameters: { type: "公告类型，详见表格" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "水利水电学院公告",
	maintainers: ["FanofZY"],
	handler,
	description: `| 公告类型 | 学院新闻 | 学术科研 | 通知公告 |
| -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        |`
};
async function handler(ctx) {
	const type = Number.parseInt(ctx.req.param("type"));
	let link;
	switch (type) {
		case 0:
			link = `${baseUrl}/index/xyxw.htm`;
			break;
		case 1:
			link = `${baseUrl}/index/xsky.htm`;
			break;
		case 2:
			link = `${baseUrl}/xxgk/tzgg.htm`;
			break;
		default: throw new Error(`Unknown type: ${type}`);
	}
	const $ = load((await got_default(link)).data);
	const list = type === 0 ? $("div.my_box_nei").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a b.am-text-truncate").text().trim(),
			pubDate: item.find("a i").text().trim(),
			link: new URL(item.find("a").attr("href"), baseUrl).href
		};
	}) : $("div.list_txt.am-fr ul.am-list li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a span").text().trim(),
			pubDate: item.find("a i").text().trim(),
			link: new URL(item.find("a").attr("href"), baseUrl).href
		};
	});
	let items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = item.link.includes("weixin") ? (await fetchArticle(item.link)).description : await (async () => {
			try {
				const $ = load((await got_default(item.link)).data);
				return $(".v_news_content").length ? $(".v_news_content").html().trim() : $(".prompt").length ? $(".prompt").html() : item.title;
			} catch {
				return item.title;
			}
		})();
		return item;
	})));
	items = items.filter((item) => item !== null);
	return {
		title: $("title").first().text(),
		link,
		item: items
	};
}
//#endregion
export { route };
