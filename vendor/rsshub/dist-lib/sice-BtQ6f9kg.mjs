import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
//#region lib/routes/uestc/sice.ts
const baseIndexUrl = "https://www.sice.uestc.edu.cn/index.htm";
const host = "https://www.sice.uestc.edu.cn/";
const route = {
	path: "/sice",
	categories: ["university"],
	example: "/uestc/sice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sice.uestc.edu.cn/"] }],
	name: "信息与通信工程学院",
	maintainers: ["huyyi", "mobyw"],
	handler,
	url: "sice.uestc.edu.cn/"
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
	const out = $(".notice p").toArray().map((item) => {
		item = $(item);
		const now = dayjs();
		let date = dayjs(now.year() + "-" + item.find("a.date").text());
		if (now < date) date = dayjs(now.year() - 1 + "-" + item.find("a.date").text());
		return {
			title: item.find("a[href]").text(),
			link: host + item.find("a[href]").attr("href"),
			pubDate: parseDate(date)
		};
	});
	return {
		title: "信通学院通知",
		link: baseIndexUrl,
		description: "电子科技大学信息与通信工程学院通知公告",
		item: out
	};
}
//#endregion
export { route };
