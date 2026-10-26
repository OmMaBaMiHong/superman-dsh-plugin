import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/comicat/search.ts
const baseUrl = "https://comicat.org";
const route = {
	path: "/search/:keyword",
	categories: ["anime"],
	example: "/comicat/search/喵萌奶茶屋+跃动青春+720P+简日",
	parameters: { keyword: "关键词，请用`+`号连接" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false
	},
	name: "搜索关键词",
	maintainers: ["Cyang39"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const { data: response } = await got_default(`${baseUrl}/search.php?keyword=${encodeURIComponent(keyword)}`);
	const $ = load(response);
	const list = $("#listTable tbody > tr").toArray().map((item) => ({
		title: $(item).find("td:nth-child(3)").text().trim(),
		link: `${baseUrl}/${$(item).find("td:nth-child(3) a").attr("href")}`,
		category: $(item).find("td:nth-child(2)").text().trim(),
		author: $(item).find("td:nth-child(8)").text().trim()
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.pubDate = parseDate($("div.main > div.slayout > div > div.c1 > div:nth-child(1) > div > p:nth-child(4)").text().split("发布时间: ", 2)[1]);
		item.enclosure_url = `magnet:?xt=urn:btih:${$("#text_hash_id").text().split("，特征码：", 2)[1]}`.trim();
		item.enclosure_type = "application/x-bittorrent";
		item.description = $("#btm > div.main > div.slayout > div > div.c2 > div:nth-child(1) > div.intro").html();
		return item;
	})));
	return {
		title: `Comicat - ${keyword}`,
		link: `${baseUrl}/search.php?keyword=${encodeURIComponent(keyword)}`,
		item: items
	};
}
//#endregion
export { route };
