import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/njglyy/utils/index.ts
async function getNoticeList(ctx, url, host, listSelector, itemSelector, titleSelector, contentSelector) {
	const $ = load((await got_default(url)).data);
	const list = $(listSelector).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(titleSelector).text(),
			link: host + item.find(itemSelector).attr("href")
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
			const preDate = $(contentSelector.date).text().match(/(\d{4}-\d{2}-\d{2})/)[1];
			item.pubDate = timezone(parseDate(preDate, "YYYY-MM-DD"), 8);
		}
		return item;
	})));
}
//#endregion
//#region lib/routes/njglyy/ygbjypx.ts
const url = "https://njglyy.com/ygb/jypx/jypx.aspx";
const host = "https://njglyy.com/ygb/jypx/";
const route = {
	path: "/ygbjypx",
	categories: ["government"],
	example: "/njglyy/ygbjypx",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["njglyy.com/ygb/jypx/jypx.aspx", "njglyy.com/"] }],
	name: "员工版教育培训",
	maintainers: ["real-jiakai"],
	handler,
	url: "njglyy.com/ygb/jypx/jypx.aspx"
};
async function handler(ctx) {
	const out = await getNoticeList(ctx, url, host, ".mtbd-list > dl", "a", "dt", {
		title: ".detail",
		content: ".detail2",
		date: "span:contains(\"发布时间\")"
	});
	return {
		title: "南京鼓楼医院 -- 员工版教育培训",
		link: url,
		item: out
	};
}
//#endregion
export { route };
