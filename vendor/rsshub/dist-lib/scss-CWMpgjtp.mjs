import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bupt/scss.ts
const route = {
	path: "/scss/tzgg",
	categories: ["university"],
	example: "/bupt/scss/tzgg",
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
		source: ["scss.bupt.edu.cn/index/tzgg1.htm"],
		target: "/scss/tzgg"
	}],
	name: "网络空间安全学院 - 通知公告",
	maintainers: ["ziri2004"],
	handler,
	url: "scss.bupt.edu.cn"
};
async function handler() {
	const rootUrl = "https://scss.bupt.edu.cn";
	const currentUrl = `${rootUrl}/index/tzgg1.htm`;
	const pageTitle = "通知公告";
	const selector = ".Newslist li";
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(selector).toArray().map((item) => {
		const $item = $(item);
		const $link = $item.find("a");
		if ($link.length === 0 || !$link.attr("href")) return null;
		const link = new URL($link.attr("href"), rootUrl).href;
		const rawDate = $item.find("span").text().replace("发布时间：", "").trim();
		return {
			title: $link.text().trim(),
			link,
			pubDateRaw: rawDate
		};
	}).filter(Boolean);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const newsContent = content(".v_news_content");
		newsContent.find("p, span, strong").each((_, el) => {
			const element = content(el);
			const text = element.text().trim();
			if (text === "") element.remove();
			else element.replaceWith(text);
		});
		item.description = newsContent.text();
		item.pubDate = timezone(parseDate(item.pubDateRaw), 8);
		return item;
	})));
	return {
		title: `北京邮电大学网络空间安全学院 - ${pageTitle}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
