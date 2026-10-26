import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/buct/cist.ts
const route = {
	path: "/cist",
	categories: ["university"],
	example: "/buct/cist",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cist.buct.edu.cn/xygg/list.htm", "cist.buct.edu.cn/xygg/main.htm"],
		target: "/cist"
	}],
	name: "信息学院",
	maintainers: ["Epic-Creeper"],
	handler,
	url: "buct.edu.cn/"
};
async function handler() {
	const rootUrl = "https://cist.buct.edu.cn";
	const currentUrl = `${rootUrl}/xygg/list.htm`;
	const $ = load((await got_default.get(currentUrl)).data);
	const list = $("ul.wp_article_list > li.list_item").toArray().map((item) => ({
		pubDate: $(item).find(".Article_PublishDate").text(),
		title: $(item).find("a").attr("title"),
		link: `${rootUrl}${$(item).find("a").attr("href")}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default.get(item.link)).data)(".wp_articlecontent").html();
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
