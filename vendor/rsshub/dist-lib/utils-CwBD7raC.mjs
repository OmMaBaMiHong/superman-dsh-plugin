import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
//#region lib/routes/pincong/utils.ts
const baseUrl = "https://pincong.rocks";
const playwrightGet = (url, cache) => cache.tryGet(url, async () => {
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	await page.goto(url, { waitUntil: "domcontentloaded" });
	const html = await page.evaluate(() => document.documentElement.innerHTML);
	await context.close();
	return html;
});
//#endregion
export { playwrightGet as n, baseUrl as t };
