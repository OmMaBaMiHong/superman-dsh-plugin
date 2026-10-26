import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
//#region lib/routes/njust/utils.ts
async function getContent(url, pptr = false) {
	if (pptr) {
		const context = await outPlaywright();
		try {
			const page = await context.newPage();
			await page.route("**/*", (route) => {
				const request = route.request();
				request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
			});
			await page.goto(url, { waitUntil: "networkidle" });
			return await page.content();
		} finally {
			await context.close();
		}
	}
	return (await got_default(url)).data;
}
//#endregion
export { getContent as t };
