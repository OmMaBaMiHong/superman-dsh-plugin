import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bupt/rczp.ts
const route = {
	path: "/rczp",
	categories: ["university"],
	example: "/bupt/rczp",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bupt.edu.cn/"] }],
	name: "人才招聘",
	maintainers: ["nczitzk"],
	handler,
	url: "bupt.edu.cn/"
};
async function handler() {
	const rootUrl = "https://www.bupt.edu.cn";
	const currentUrl = `${rootUrl}/rczp.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".date-block").toArray().map((item) => {
		item = $(item);
		return {
			title: item.next().text(),
			link: `${rootUrl}/${item.next().attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".v_news_content").html();
		item.pubDate = timezone(parseDate(content(".info span").first().text().replace("发布时间 : ", "")), 8);
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
