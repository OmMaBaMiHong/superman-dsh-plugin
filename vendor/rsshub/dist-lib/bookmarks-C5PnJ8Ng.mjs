import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { i as maskHeader, n as getToken, r as pixivGot, t as utils_default } from "./utils-DCw-yt542.mjs";
import queryString from "query-string";
//#region lib/routes/pixiv/api/get-bookmarks.ts
/**
* 获取用户的收藏
*
* @param {string} user_id 目标用户id
* @param {string} token pixiv oauth token
* @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
*/
function getBookmarks(user_id, token) {
	return pixivGot("https://app-api.pixiv.net/v1/user/bookmarks/illust", {
		headers: {
			...maskHeader,
			Authorization: "Bearer " + token
		},
		searchParams: queryString.stringify({
			user_id,
			restrict: "public"
		})
	});
}
//#endregion
//#region lib/routes/pixiv/api/get-user-detail.ts
/**
* pixiv 用户
* @typedef {{user: {id: number, name: string, account: string, profile_image_urls: any, comment: string}, profile: any} userDetail
*/
/**
* 获取用户信息
*
* @param {string} user_id 目标用户id
* @param {string} token pixiv oauth token
* @returns {Promise<got.AxiosResponse<userDetail>>}
*/
function getUserDetail(user_id, token) {
	return pixivGot("https://app-api.pixiv.net/v1/user/detail", {
		headers: {
			...maskHeader,
			Authorization: "Bearer " + token
		},
		searchParams: queryString.stringify({ user_id })
	});
}
//#endregion
//#region lib/routes/pixiv/bookmarks.ts
const route = {
	path: "/user/bookmarks/:id",
	categories: ["social-media"],
	example: "/pixiv/user/bookmarks/15288095",
	parameters: { id: "user id, available in user's homepage URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["www.pixiv.net/users/:id/bookmarks/artworks", "www.pixiv.net/en/users/:id/bookmarks/artworks"] }],
	name: "User Bookmark",
	maintainers: ["EYHN"],
	handler
};
async function handler(ctx) {
	if (!config.pixiv || !config.pixiv.refreshToken) throw new ConfigNotFoundError("pixiv RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const id = ctx.req.param("id");
	const token = await getToken();
	if (!token) throw new ConfigNotFoundError("pixiv not login");
	const [bookmarksResponse, userDetailResponse] = await Promise.all([getBookmarks(id, token), getUserDetail(id, token)]);
	const illusts = bookmarksResponse.data.illusts;
	const username = userDetailResponse.data.user.name;
	return {
		title: `${username} 的收藏`,
		link: `https://www.pixiv.net/users/${id}/bookmarks/artworks`,
		description: `${username} 的 pixiv 最新收藏`,
		item: illusts.map((illust) => {
			const images = utils_default.getImgs(illust);
			return {
				title: illust.title,
				author: illust.user.name,
				pubDate: parseDate(illust.create_date),
				description: `${illust.caption}<br><p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join("")}`,
				link: `https://www.pixiv.net/artworks/${illust.id}`
			};
		})
	};
}
//#endregion
export { route };
