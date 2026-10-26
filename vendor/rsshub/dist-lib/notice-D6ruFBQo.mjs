import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/szse/notice.ts
const host = "http://www.szse.cn/";
const route = {
	path: "/notice",
	categories: ["finance"],
	example: "/szse/notice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["szse.cn/disclosure/notice/company/index.html", "szse.cn/"] }],
	name: "上市公告 - 可转换债券",
	maintainers: ["Jeason0228", "nczitzk"],
	handler,
	url: "szse.cn/disclosure/notice/company/index.html"
};
async function handler() {
	const link = "http://www.szse.cn/disclosure/notice/company/index.html";
	const $ = load((await got_default.get(link, { Referer: host })).data);
	function getData(jscontent, option) {
		const urlpattern = /(?<=curHref = ').*?(?=';)/;
		const titlePattern = /(?<=curTitle =').*?(?=';)/;
		switch (option) {
			case "title": return jscontent.match(titlePattern);
			case "url": return jscontent.match(urlpattern);
			default: break;
		}
	}
	const list = $(".article-list .newslist li").toArray().map((element) => {
		element = $(element);
		return {
			title: getData(element.find("script").text(), "title"),
			link: new URL(getData(element.find("script").text(), "url"), link).href,
			date: element.find("span.time").text().trim()
		};
	});
	return {
		title: "深圳证券交易所——上市公告-可转换债券",
		link,
		item: await Promise.all(list.map(async (info) => {
			const title = info.title;
			const date = info.date;
			const itemUrl = new URL(info.link, host).href;
			const cacheIn = await cache_default.get(itemUrl);
			if (cacheIn) return JSON.parse(cacheIn);
			const single = {
				title,
				link: itemUrl,
				description: load((await got_default.get(itemUrl, { Referer: host })).data)("#desContent").html(),
				pubDate: new Date(date).toDateString()
			};
			cache_default.set(itemUrl, JSON.stringify(single));
			return single;
		}))
	};
}
//#endregion
export { route };
