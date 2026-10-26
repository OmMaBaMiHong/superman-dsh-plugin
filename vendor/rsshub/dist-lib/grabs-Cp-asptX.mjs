import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/njucm/utils/index.ts
async function getNoticeList(ctx, url, host, listSelector, titleSelector, contentSelector) {
	const $ = load((await got_default(url)).data);
	const list = $(listSelector).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(titleSelector).attr("title"),
			link: host + item.find(titleSelector).attr("href")
		};
	});
	return await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await got_default(item.link);
		if (response.redirectUrls.length) {
			item.link = response.redirectUrls[0];
			item.description = "该通知无法直接预览，请点击原文链接↑查看";
		} else {
			const $ = load(response.data);
			item.title = $(contentSelector.title).text();
			item.description = $(contentSelector.content).html().replaceAll("src=\"/", () => `src="${new URL(".", host).href}`).replaceAll("href=\"/", () => `href="${new URL(".", host).href}`).trim();
			item.pubDate = timezone(parseDate($(contentSelector.date).text()), 8);
		}
		return item;
	})));
}
//#endregion
//#region lib/routes/njucm/grabs.ts
const url = "https://gra.njucm.edu.cn/2899/list.htm";
const host = "https://gra.njucm.edu.cn";
const route = {
	path: "/grabszs",
	categories: ["university"],
	example: "/njucm/grabszs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["lib.njucm.edu.cn/2899/list.htm", "lib.njucm.edu.cn/"] }],
	name: "研究生院博士招生",
	maintainers: ["real-jiakai"],
	handler,
	url: "lib.njucm.edu.cn/2899/list.htm"
};
async function handler(ctx) {
	const out = await getNoticeList(ctx, url, host, "#wp_news_w3 > table > tbody > tr", "a", {
		title: ".Article_Title",
		content: ".Article_Content",
		date: ".Article_PublishDate"
	});
	return {
		title: "南京中医药大学 -- 博士招生",
		link: url,
		item: out
	};
}
//#endregion
export { route };
