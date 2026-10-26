import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/bluestacks/release.ts
const pageUrl = "https://support.bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5";
const route = {
	path: "/release/5",
	categories: ["program-update"],
	example: "/bluestacks/release/5",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5", "bluestacks.com/"] }],
	name: "BlueStacks 5 Release Notes",
	maintainers: ["TonyRL"],
	handler,
	url: "bluestacks.com/hc/en-us/articles/360056960211-Release-Notes-BlueStacks-5"
};
async function handler() {
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
	const res = await page.evaluate(() => document.documentElement.innerHTML);
	await page.close();
	const $ = cheerio.load(res);
	const list = $("div h3 a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
		});
		await page.goto(item.link, { waitUntil: "domcontentloaded" });
		const res = await page.evaluate(() => document.documentElement.innerHTML);
		const $ = cheerio.load(res);
		await page.close();
		item.description = $("div.article__body").html();
		item.pubDate = parseDate($("div.meta time").attr("datetime"));
		return item;
	})));
	await context.close();
	return {
		title: $(".article__title").text().trim(),
		description: $("meta[name=description]").text().trim(),
		link: pageUrl,
		image: $("link[rel=\"shortcut icon\"]").attr("href"),
		item: items
	};
}
//#endregion
export { route };
