import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/swjtu/jtys/yjs.ts
const rootURL = "https://ctt.swjtu.edu.cn";
const url_addr = `${rootURL}/yethan/WebIndexAction?setAction=newsList&bigTypeId=0E4BF4D36E232918`;
const getItem = (item, cache) => {
	const news_info = item.find("div[class=\"news-title newsInfo\"]");
	const news_month = item.find(".month").text();
	const news_day = item.find(".day").text();
	const info_id = news_info.attr("newsid");
	const info_title = news_info.text();
	const link = `${rootURL}/yethan/WebIndexAction?setAction=newsInfo&newsId=${info_id}`;
	return cache.tryGet(link, async () => {
		const info_text = load((await got_default({
			method: "get",
			url: link
		})).data)(".news-left").html();
		return {
			title: info_title,
			pubDate: parseDate(`${news_month}.${news_day}`),
			link,
			description: info_text
		};
	});
};
const route = {
	path: "/jtys/yjs",
	categories: ["university"],
	example: "/swjtu/jtys/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "交通运输与物流学院",
	maintainers: ["qizidog"],
	handler,
	description: "#### 研究生通知 {#xi-nan-jiao-tong-da-xue-jiao-tong-yun-shu-yu-wu-liu-xue-yuan-yan-jiu-sheng-tong-zhi}"
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: url_addr
	})).data);
	const list = $("[class='news-list flex']");
	const items = await Promise.all(list.toArray().map((i) => {
		const item = $(i);
		return getItem(item, cache_default);
	}));
	return {
		title: "西南交大交运学院-研究生通知",
		link: url_addr,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
