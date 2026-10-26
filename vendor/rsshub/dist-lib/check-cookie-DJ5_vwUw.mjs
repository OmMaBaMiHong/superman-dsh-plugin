import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
//#region lib/routes/bilibili/check-cookie.ts
const apiRoute = {
	path: "/check-cookie",
	description: "检查 bilibili cookie 是否有效",
	maintainers: ["DIYgod"],
	handler
};
async function handler() {
	const cookie = await cache_default.getCookie();
	if (!cookie) return { code: -1 };
	const response = await rofetch("https://api.bilibili.com/x/web-interface/nav", { headers: {
		Referer: "https://space.bilibili.com/1/",
		Cookie: cookie
	} });
	const isResponseValid = response.code === 0 && !!response.data.mid;
	const subtitleResponse = await rofetch("https://api.bilibili.com/x/player/wbi/v2?bvid=BV1iU411o7R2&cid=1550543560", { headers: {
		Referer: "https://www.bilibili.com/video/BV1iU411o7R2",
		Cookie: cookie
	} });
	const subtitles = subtitleResponse?.data?.subtitle?.subtitles || [];
	const isSubtitleResponseValid = subtitleResponse?.data?.permission !== "0" && subtitles.length > 0;
	return { code: isResponseValid && isSubtitleResponseValid ? 0 : -1 };
}
//#endregion
export { apiRoute };
