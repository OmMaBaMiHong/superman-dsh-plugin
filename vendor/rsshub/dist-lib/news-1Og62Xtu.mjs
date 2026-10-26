import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gamegene/news.ts
const route = {
	path: "/news",
	categories: ["game"],
	example: "/gamegene/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.gamegene.cn/news"] }],
	name: "资讯",
	maintainers: ["lone1y-51"],
	handler,
	url: "news.gamegene.cn/news"
};
async function handler() {
	const url = "https://gamegene.cn/news";
	const { data: response } = await got_default({
		method: "get",
		url
	});
	const $ = load(response);
	const list = $("div.mr245").toArray().map((item) => {
		item = $(item);
		const aEle = item.find("a").first();
		const href = aEle.attr("href");
		return {
			title: aEle.find("h3").first().text(),
			link: href,
			author: item.find("a.namenode").text(),
			category: item.find("span.r").text()
		};
	});
	return {
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default({
				method: "get",
				url: item.link
			});
			const $ = load(response);
			item.pubDate = parseDate($("div.meta").find("time").first().text());
			item.description = $("div.content").first().html();
			return item;
		}))),
		link: url,
		title: "游戏基因 GameGene"
	};
}
//#endregion
export { route };
