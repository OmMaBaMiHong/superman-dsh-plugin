import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as getFollowingsItems } from "./utils-B2jWrP_y2.mjs";
//#region lib/routes/skeb/following-works.ts
const route = {
	path: "/following_works/:username",
	categories: ["picture"],
	example: "/skeb/following_works/@brm2_1925",
	parameters: { username: "Skeb Username with @" },
	features: {
		requireConfig: [{
			name: "SKEB_BEARER_TOKEN",
			optional: false,
			description: "在瀏覽器開發者工具（F12）的主控台中輸入 `localStorage.getItem(\"token\")` 獲取"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Following Works",
	maintainers: ["SnowAgar25"],
	handler,
	radar: [{
		title: "Following Works",
		source: ["skeb.jp/:username"],
		target: "/following_works/:username"
	}],
	description: "Get the latest works for the specified user's followings on Skeb."
};
async function handler(ctx) {
	const username = ctx.req.param("username");
	if (!config.skeb || !config.skeb.bearerToken) throw new ConfigNotFoundError("Skeb followings RSS is disabled due to the lack of relevant config");
	const items = await getFollowingsItems(username, "following_works");
	return {
		title: `Skeb - ${username} - フォロー中のクリエイターの新着作品`,
		link: `https://skeb.jp/${username}`,
		item: items
	};
}
//#endregion
export { route };
