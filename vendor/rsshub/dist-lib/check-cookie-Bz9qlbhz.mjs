import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
//#region lib/routes/zhihu/check-cookie.ts
const apiRoute = {
	path: "/check-cookie",
	description: "检查 zhihu cookie 是否有效",
	maintainers: ["DIYgod"],
	handler
};
async function handler() {
	const cookie = config.zhihu.cookies;
	if (!cookie) return { code: -1 };
	return { code: (await rofetch("https://www.zhihu.com/api/v4/me?include=is_realname", { headers: {
		Referer: "https://www.zhihu.com/",
		Cookie: cookie
	} })).name ? 0 : -1 };
}
//#endregion
export { apiRoute };
