import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { t as getCookies } from "./playwright-utils-S-7KcaVy.mjs";
//#region lib/routes/xueqiu/cookies.ts
const parseToken = (link) => cache_default.tryGet("xueqiu:token", async () => {
	const page = await (await outPlaywright()).newPage();
	await page.route("**/*", (route) => {
		const type = route.request().resourceType();
		type === "document" || type === "script" ? route.continue() : route.abort();
	});
	await page.goto(link, { waitUntil: "domcontentloaded" });
	await page.evaluate(() => document.documentElement.innerHTML);
	return await getCookies(page);
}, config.cache.routeExpire, false);
//#endregion
export { parseToken as t };
