import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/uestc/cqe.ts
const baseUrl = "https://cqe.uestc.edu.cn/";
const mapUrl = {
	hdyg: "xwgg/hdyg.htm",
	tzgg: "xwgg/tzgg.htm"
};
const mapTitle = {
	hdyg: "活动预告",
	tzgg: "通知公告"
};
const route = {
	path: "/cqe/:type?",
	categories: ["university"],
	example: "/uestc/cqe/tzgg",
	parameters: { type: "默认为 `tzgg`" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cqe.uestc.edu.cn/"],
		target: "/cqe"
	}],
	name: "文化素质教育中心",
	maintainers: ["truobel", "mobyw"],
	handler,
	url: "cqe.uestc.edu.cn/",
	description: `| 活动预告 | 通知公告 |
| -------- | -------- |
| hdyg     | tzgg     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "tzgg";
	const pageUrl = mapUrl[type];
	if (!pageUrl) throw new InvalidParameterError("type not supported");
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(baseUrl + pageUrl, { waitUntil: "networkidle" });
	const content = await page.content();
	await context.close();
	const $ = load(content);
	const out = $($("div.Newslist li")).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: baseUrl + item.find("a").attr("href").slice(3),
			pubDate: parseDate(item.find("span").text().slice(1, -1))
		};
	});
	return {
		title: `大学生文化素质教育中心-${mapTitle[type]}`,
		link: baseUrl,
		description: "电子科技大学大学生文化素质教育中心通知",
		item: out
	};
}
//#endregion
export { route };
