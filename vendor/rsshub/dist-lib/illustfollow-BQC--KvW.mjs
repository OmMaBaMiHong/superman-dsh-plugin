import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { i as maskHeader, n as getToken, r as pixivGot, t as utils_default } from "./utils-DCw-yt542.mjs";
import queryString from "query-string";
//#region lib/routes/pixiv/api/get-illust-follows.ts
/**
* 获取用户关注的画师们的最新插画
* @param {string} token pixiv oauth token
* @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
*/
function getUserIllustFollows(token) {
	return pixivGot("https://app-api.pixiv.net/v2/illust/follow", {
		headers: {
			...maskHeader,
			Authorization: "Bearer " + token
		},
		searchParams: queryString.stringify({ restrict: "public" })
	});
}
//#endregion
//#region lib/routes/pixiv/illustfollow.ts
const route = {
	path: "/user/illustfollows",
	categories: ["social-media"],
	example: "/pixiv/user/illustfollows",
	parameters: {},
	features: {
		requireConfig: [{
			name: "PIXIV_REFRESHTOKEN",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["www.pixiv.net/bookmark_new_illust.php"] }],
	name: "Following timeline",
	maintainers: ["ClarkeCheng"],
	handler,
	url: "www.pixiv.net/bookmark_new_illust.php",
	description: `::: warning
Only for self-hosted
:::`
};
async function handler() {
	if (!config.pixiv || !config.pixiv.refreshToken) throw new ConfigNotFoundError("pixiv RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const token = await getToken();
	if (!token) throw new ConfigNotFoundError("pixiv not login");
	return {
		title: "Pixiv关注的新作品",
		link: "https://www.pixiv.net/bookmark_new_illust.php",
		description: "Pixiv关注的画师们的最新作品",
		item: (await getUserIllustFollows(token)).data.illusts.map((illust) => {
			const images = utils_default.getImgs(illust);
			return {
				title: illust.title,
				author: illust.user.name,
				pubDate: parseDate(illust.create_date),
				description: `${illust.caption}<br><p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join("")}`,
				link: `https://www.pixiv.net/artworks/${illust.id}`,
				category: illust.tags.map((tag) => tag.name)
			};
		})
	};
}
//#endregion
export { route };
