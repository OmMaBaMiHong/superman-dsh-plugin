import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/tiktok/live.ts
const baseUrl = "https://www.tiktok.com";
const route = {
	path: "/live/:user",
	categories: ["social-media"],
	example: "/tiktok/live/@shinichifuku",
	parameters: { user: "User ID, including @" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.tiktok.com/:user/live"],
		target: "/live/:user"
	}],
	name: "Live",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { user } = ctx.req.param();
	const link = `${baseUrl}/${user}/live`;
	const { user: userInfo, liveRoom } = await cache_default.tryGet(`tiktok:live:${user}`, async () => {
		const $ = load(await rofetch(link));
		return JSON.parse($("script#SIGI_STATE").text()).LiveRoom.liveRoomUserInfo;
	}, config.cache.routeExpire, false);
	const status = liveRoom.status;
	let title;
	switch (status) {
		case 2:
			title = liveRoom.title || `${userInfo.nickname}'s going live now!`;
			break;
		case 4:
			title = `${userInfo.nickname} is not live currently.`;
			break;
		default:
			title = `${userInfo.nickname}'s live status is unknown (status ${status}).`;
			break;
	}
	const items = [{
		title,
		pubDate: parseDate(liveRoom.startTime, "X"),
		author: userInfo.nickname,
		link,
		guid: `${userInfo.roomId}:${liveRoom.streamId}:${liveRoom.status}`
	}];
	return {
		title: `${userInfo.nickname} (@${userInfo.uniqueId})'s Live Stream - TikTok`,
		description: userInfo.signature,
		image: userInfo.avatarLarger || userInfo.avatarMedium || userInfo.avatarThumb,
		link,
		item: items
	};
}
//#endregion
export { route };
