import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/piyao/jrpy.ts
const rootUrl = "https://www.piyao.org.cn";
const route = {
	path: "/jrpy",
	categories: ["other"],
	example: "/piyao/jrpy",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["piyao.org.cn/jrpy/index.htm"] }],
	name: "今日辟谣",
	maintainers: ["Fatpandac"],
	handler,
	url: "piyao.org.cn/jrpy/index.htm"
};
async function handler() {
	const currentUrl = `${rootUrl}/jrpy/index.htm`;
	const $ = load((await got_default(currentUrl)).data);
	const list = $("ul#list li").toArray().map((item) => ({
		title: $(item).find("a").text(),
		link: new URL($(item).find("a").attr("href"), rootUrl).href
	}));
	return {
		title: "今日辟谣",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default(item.link)).data);
			item.title = content("div.con_tit > h2").text();
			item.description = content("div.con_txt").html();
			item.pubDate = parseDate(content("div.con_tit > p > span").text().split("时间：", 2)[1]);
			return item;
		})))
	};
}
//#endregion
export { route };
