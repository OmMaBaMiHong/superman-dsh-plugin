import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/pbc/goutongjiaoliu.ts
const route = {
	path: "/goutongjiaoliu",
	categories: ["finance"],
	example: "/gov/pbc/goutongjiaoliu",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["pbc.gov.cn/goutongjiaoliu/113456/113469/index.html"] }],
	name: "沟通交流",
	maintainers: ["nczitzk"],
	handler,
	url: "pbc.gov.cn/goutongjiaoliu/113456/113469/index.html"
};
async function handler() {
	const link = "http://www.pbc.gov.cn/goutongjiaoliu/113456/113469/index.html";
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(link, { waitUntil: "domcontentloaded" });
	const $ = load(await page.evaluate(() => document.documentElement.innerHTML));
	const list = $("font.newslist_style").toArray().map((item) => {
		item = $(item);
		const a = item.find("a[title]");
		return {
			title: a.attr("title"),
			link: new URL(a.attr("href"), "http://www.pbc.gov.cn").href
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailPage = await context.newPage();
		await detailPage.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
		});
		await detailPage.goto(item.link, { waitUntil: "domcontentloaded" });
		const content = load(await detailPage.evaluate(() => document.documentElement.innerHTML));
		item.description = content("#zoom").html();
		item.pubDate = timezone(parseDate(content(".hui12").eq(5).text()), 8);
		return item;
	})));
	await context.close();
	return {
		title: "中国人民银行 - 沟通交流",
		link,
		item: items
	};
}
//#endregion
export { route };
