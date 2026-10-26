import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/hottoys/index.ts
const route = {
	path: "/",
	categories: ["shopping"],
	example: "/hottoys",
	radar: [{ source: ["hottoys.com.hk/"] }],
	name: "Toys List",
	maintainers: ["jw0903"],
	handler,
	url: "hottoys.com.hk/",
	features: { requirePuppeteer: true }
};
async function handler() {
	const baseUrl = "https://www.hottoys.com.hk";
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
	const response = await page.content();
	await page.close();
	const $ = load(response);
	const items = $("li.productListItem").toArray().map((item) => {
		const dom = $(item);
		const a = dom.find("a").first();
		const img = dom.find("img").first();
		return {
			title: img.attr("title") ?? "hottoys",
			link: `${baseUrl}/${a.attr("href")}`,
			description: `<img src="${baseUrl}${img.attr("src")}" />`,
			guid: a.attr("href")
		};
	});
	await context.close();
	return {
		title: "Hot Toys New Products",
		link: baseUrl,
		item: items
	};
}
//#endregion
export { route };
