import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { i as maskHeader, n as getToken, r as pixivGot, t as utils_default } from "./utils-DCw-yt542.mjs";
import queryString from "query-string";
//#region lib/routes/pixiv/api/get-illusts.ts
/**
* 获取用户插画作品
* @param {string} user_id 目标用户id
* @param {string} token pixiv oauth token
* @returns {Promise<got.AxiosResponse<{illusts: illust[]}>>}
*/
function getIllusts(user_id, token) {
	return pixivGot("https://app-api.pixiv.net/v1/user/illusts", {
		headers: {
			...maskHeader,
			Authorization: "Bearer " + token
		},
		searchParams: queryString.stringify({
			user_id,
			filter: "for_ios"
		})
	});
}
//#endregion
//#region lib/routes/pixiv/user.ts
const route = {
	path: "/user/:id",
	categories: ["social-media"],
	view: 2,
	example: "/pixiv/user/15288095",
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
	radar: [{ source: ["www.pixiv.net/users/:id", "www.pixiv.net/en/users/:id"] }],
	name: "User Activity",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	if (!config.pixiv || !config.pixiv.refreshToken) throw new ConfigNotFoundError("pixiv RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const id = ctx.req.param("id");
	const token = await getToken();
	if (!token) throw new ConfigNotFoundError("pixiv not login");
	const illusts = (await getIllusts(id, token)).data.illusts;
	const username = illusts[0].user.name;
	return {
		title: `${username} 的 pixiv 动态`,
		link: `https://www.pixiv.net/users/${id}`,
		image: utils_default.getProxiedImageUrl(illusts[0].user.profile_image_urls.medium),
		description: `${username} 的 pixiv 最新动态`,
		item: illusts.map((illust) => {
			const images = utils_default.getImgs(illust);
			return {
				title: illust.title,
				author: username,
				pubDate: parseDate(illust.create_date),
				description: `${illust.caption}<br><p>画师：${username} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join("")}`,
				link: `https://www.pixiv.net/artworks/${illust.id}`,
				category: illust.tags.map((t) => t.name)
			};
		})
	};
}
//#endregion
export { route };
