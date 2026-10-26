import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/zhihu/xhu/auth.ts
var auth_default = { getCookie: () => {
	return cache_default.tryGet("zhihu-xhu-cookie", async () => {
		const udidCookieArray = (await rofetch.raw("https://api.zhihuvvv.workers.dev/appcloud/v1/device", {
			method: "get",
			headers: { Referer: "https://api.zhihuvvv.workers.dev" }
		})).headers.getSetCookie();
		const udidCookie = udidCookieArray.join("; ");
		return [...(await rofetch.raw("https://api.zhihuvvv.workers.dev/guests/token", {
			method: "get",
			headers: {
				Referer: "https://api.zhihuvvv.workers.dev",
				Cookie: udidCookie
			}
		})).headers.getSetCookie(), ...udidCookieArray].join("; ");
	});
} };
//#endregion
export { auth_default as t };
