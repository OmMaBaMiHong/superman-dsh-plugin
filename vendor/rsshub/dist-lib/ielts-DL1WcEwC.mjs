import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/ielts/index.ts
const targetUrl = "https://ielts.neea.cn/allnews?locale=zh_CN";
const route = {
	path: "/",
	radar: [{
		source: ["ielts.neea.cn/allnews"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["zenxds"],
	handler,
	url: "ielts.neea.cn/allnews"
};
async function handler() {
	const $ = load(await cache_default.tryGet(targetUrl, async () => {
		const context = await outPlaywright();
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
		});
		await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
		await page.waitForSelector("div.container");
		const html = await page.evaluate(() => document.documentElement.innerHTML);
		await context.close();
		return html;
	}, config.cache.routeExpire, false));
	const list = $("#newsListUl li").toArray().map((elem) => {
		const $elem = $(elem);
		return {
			title: $elem.find("a").text(),
			link: $elem.find("a").attr("href"),
			pubDate: timezone(parseDate($elem.find("span").eq(-1).text().replaceAll(/[[\]]/g, "").trim(), 8))
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".content").html();
		return item;
	})));
	return {
		title: "IELTS雅思最新消息",
		link: targetUrl,
		item: items
	};
}
//#endregion
export { route };
