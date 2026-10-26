import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { t as getCookies } from "./playwright-utils-S-7KcaVy.mjs";
//#region lib/routes/nuaa/utils/pypasswaf.ts
/**
* async function 获取cookie
* @desc 返回一个可用的cookie，使用 `got` 发起请求的时候，传入到`options.headers.cookie`即可
*/
async function getCookie(host) {
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(host, { waitUntil: "networkidle" });
	const cookie = await getCookies(page);
	await context.close();
	return cookie;
}
//#endregion
export { getCookie as t };
