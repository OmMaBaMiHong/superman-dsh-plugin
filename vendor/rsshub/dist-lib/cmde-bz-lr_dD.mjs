import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/cmde/index.ts
const rootURL = "https://www.cmde.org.cn";
const route = {
	path: "/:cate{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const cate = ctx.req.param("cate") ?? "xwdt/zxyw";
	const url = `${rootURL}/${cate}/`;
	const context = await outPlaywright();
	const data = await cache_default.tryGet(url, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
		});
		await page.goto(url, { waitUntil: "domcontentloaded" });
		await page.waitForSelector(".list");
		const html = await page.evaluate(() => document.documentElement.innerHTML);
		await page.close();
		const $ = load(html);
		return {
			title: $("head title").text(),
			description: $("meta[name=ColumnDescription]").attr("content"),
			items: $(".list ul li").toArray().map((item) => {
				item = $(item);
				return {
					title: $(item).find("a").attr("title"),
					link: new URL($(item).find("a").attr("href"), url).href
				};
			})
		};
	});
	const items = await Promise.all(data.items.map((item) => cache_default.tryGet(item.link, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
		});
		await page.goto(item.link, { waitUntil: "domcontentloaded" });
		await page.waitForSelector(".text");
		const html = await page.evaluate(() => document.documentElement.innerHTML);
		await page.close();
		const $ = load(html);
		item.description = $(".text").html();
		item.pubDate = timezone(parseDate($("meta[name=\"PubDate\"]").attr("content")), 8);
		return item;
	})));
	await context.close();
	return {
		title: data.title,
		description: data.description,
		link: url,
		item: items
	};
}
//#endregion
export { route };
