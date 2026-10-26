import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/seu/yjs.ts
const url = "https://seugs.seu.edu.cn/26671/list.htm";
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/seu/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["seugs.seu.edu.cn/26671/list.htm", "seugs.seu.edu.cn/"] }],
	name: "研究生院全部公告",
	maintainers: ["Denkiyohou"],
	handler,
	url: "seugs.seu.edu.cn/26671/list.htm"
};
async function handler() {
	const $ = load((await got_default(url)).data);
	const list = $(".news").toArray().map((element) => {
		return {
			title: $(element).find("span.news_title > a").attr("title"),
			link: `https://seugs.seu.edu.cn${$(element).find("span.news_title > a").attr("href")}`,
			date: $(element).find("span.news_meta").text()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)(".wp_articlecontent").html();
		item.pubDate = new Date(item.date).toUTCString();
		return item;
	})));
	return {
		title: "东南大学研究生公告",
		link: url,
		item: items
	};
}
//#endregion
export { route };
