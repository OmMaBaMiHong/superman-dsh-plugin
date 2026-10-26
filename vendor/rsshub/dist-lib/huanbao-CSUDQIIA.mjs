import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/bjx/huanbao.ts
const route = {
	path: "/huanbao",
	categories: ["traditional-media"],
	example: "/bjx/huanbao",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["huanbao.bjx.com.cn/yw", "huanbao.bjx.com.cn/"] }],
	name: "环保要闻",
	maintainers: ["zsimple"],
	handler,
	url: "huanbao.bjx.com.cn/yw"
};
async function handler() {
	const listURL = "https://huanbao.bjx.com.cn/yw/";
	const $ = load((await got_default(listURL)).data);
	let items = $(".cc-layout-3 .cc-list-content li").toArray().map((e) => {
		e = $(e);
		return {
			title: e.find("a").attr("title"),
			link: e.find("a").attr("href"),
			pubDate: parseDate(e.find("span").text())
		};
	});
	items = await pMap(items, (item) => fetchPage(item.link), { concurrency: 3 });
	return {
		title: "北极星环保 - 环保行业垂直门户网站",
		link: listURL,
		item: items
	};
}
const fetchPage = (link) => cache_default.tryGet(link, async () => {
	const pages = [];
	const $page = load((await got_default(link)).data);
	pages.push($page);
	const pagelinks = $page("#article_cont .cc-paging a");
	if (pagelinks.length > 0) for (const pagelink of pagelinks) {
		const $a = $page(pagelink);
		if (!/^\d+$/.test($a.text().trim())) continue;
		const sublink = new URL($a.attr("href"), link).href;
		const result = await got_default(sublink);
		pages.push(load(result.data));
	}
	return {
		title: $page("title").text(),
		description: pages.map(($p) => $p(".cc-article").html() ?? "").join(""),
		pubDate: timezone(parseDate($page(".cc-headline .box p span").eq(0).text()), 8),
		link,
		author: $page(".cc-headline .box p span").eq(1).text()
	};
});
//#endregion
export { route };
