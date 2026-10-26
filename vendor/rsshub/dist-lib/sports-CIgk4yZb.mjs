import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/swjtu/sports.ts
const rootURL = "https://sports.swjtu.edu.cn";
const pageURL = `${rootURL}/xwzx.htm`;
const route = {
	path: "/sports",
	categories: ["university"],
	example: "/swjtu/sports",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sports.swjtu.edu.cn/"] }],
	name: "体育学院",
	description: "新闻资讯",
	maintainers: ["AzureG03"],
	handler
};
const getItem = (item, cache) => {
	const title = item.find("p.toe").text();
	const link = `${rootURL}/${item.find("a").attr("href")}`;
	return cache.tryGet(link, async () => {
		const $ = load(await rofetch(link));
		const pubDate = parseDate($("div.info span:nth-of-type(3)").text().slice(3).match(/\d{4}(.)\d{1,2}\1\d{1,2}/)?.[0]);
		const description = $("div.detail-wrap").html();
		return {
			title,
			pubDate,
			link,
			description
		};
	});
};
async function handler() {
	const $ = load(await rofetch(pageURL));
	const $list = $("div.news-list > ul > li");
	const items = await Promise.all($list.toArray().map((i) => {
		const $item = $(i);
		return getItem($item, cache_default);
	}));
	return {
		title: "西南交大体院-新闻资讯",
		link: pageURL,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
