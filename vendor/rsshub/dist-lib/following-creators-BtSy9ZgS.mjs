import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as getFollowingsItems } from "./utils-B2jWrP_y2.mjs";
//#region lib/routes/skeb/following-creators.ts
const route = {
	path: "/following_creators/:username",
	categories: ["picture"],
	example: "/skeb/following_creators/@brm2_1925",
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
	name: "Following Creators",
	maintainers: ["SnowAgar25"],
	handler,
	radar: [{
		title: "Following Creators",
		source: ["skeb.jp/:username"],
		target: "/following_creators/:username"
	}],
	description: "Get the list of creators the specified user is following on Skeb."
};
async function handler(ctx) {
	const username = ctx.req.param("username");
	if (!config.skeb || !config.skeb.bearerToken) throw new ConfigNotFoundError("Skeb followings RSS is disabled due to the lack of relevant config");
	const items = await getFollowingsItems(username, "following_creators");
	return {
		title: `Skeb - ${username} - フォロー中のクリエイター`,
		link: `https://skeb.jp/${username}`,
		item: items
	};
}
//#endregion
export { route };
