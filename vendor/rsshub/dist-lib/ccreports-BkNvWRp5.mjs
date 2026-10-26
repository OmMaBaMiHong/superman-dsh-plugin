import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ccreports/index.ts
const rootUrl = "https://www.ccreports.com.cn";
const route = {
	path: "/article",
	categories: ["shopping"],
	example: "/ccreports/article",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.ccreports.com.cn/"] }],
	name: "要闻",
	maintainers: ["EsuRt", "Fatpandac"],
	handler,
	url: "www.ccreports.com.cn/"
};
async function handler() {
	const $ = load((await got_default.get(rootUrl)).data);
	const list = $("div.index-four-content > div.article-box").find("div.new-child").toArray().map((item) => ({
		title: $(item).find("p.new-title").text(),
		link: new URL($(item).find("a").attr("href"), rootUrl).href,
		author: $(item).find("p.new-desc").text().match(/作者：(.*?)\s/)[1]
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default.get(item.link)).data);
		item.description = $("div.pdbox").html();
		item.pubDate = timezone(parseDate($("div.newbox > div.newtit > p").text(), "YYYY-MM-DD HH:mm:ss"), 8);
		return item;
	})));
	return {
		title: "消费者报道",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
