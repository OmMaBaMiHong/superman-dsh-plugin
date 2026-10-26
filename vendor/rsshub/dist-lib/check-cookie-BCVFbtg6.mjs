import { t as checkCookie } from "./util-BAxAjUpU.mjs";
//#region lib/routes/xiaohongshu/check-cookie.ts
const apiRoute = {
	path: "/check-cookie",
	description: "检查小红书 cookie 是否有效",
	maintainers: ["DIYgod"],
	handler
};
async function handler() {
	return { code: await checkCookie() ? 0 : -1 };
}
//#endregion
export { apiRoute };
