import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/uestc/auto.ts
const baseIndexUrl = "https://www.auto.uestc.edu.cn/xwgg/tzgs.htm";
const route = {
	path: "/auto",
	categories: ["university"],
	example: "/uestc/auto",
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["auto.uestc.edu.cn/"] }],
	name: "自动化工程学院",
	maintainers: ["talengu", "mobyw"],
	handler,
	url: "auto.uestc.edu.cn/"
};
async function handler() {
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(baseIndexUrl, { waitUntil: "networkidle" });
	const content = await page.content();
	await context.close();
	const $ = load(content);
	const out = $($("a.flex.wl")).toArray().map((item) => {
		const $item = $(item);
		const newsTitle = $item.attr("title") ?? $item.find("h3").text().trim();
		const newsLink = new URL($item.attr("href") ?? "", baseIndexUrl).href;
		const newsPubDate = $item.find(".date").text().trim();
		return {
			title: newsTitle,
			description: $item.find(".p1").text().trim(),
			link: newsLink,
			pubDate: parseDate(`${newsPubDate.slice(0, 4)}-${newsPubDate.slice(4)}`)
		};
	});
	return {
		title: "电子科技大学自动化学院通知",
		link: baseIndexUrl,
		description: "电子科技大学自动化工程学院通知",
		item: out
	};
}
//#endregion
export { route };
