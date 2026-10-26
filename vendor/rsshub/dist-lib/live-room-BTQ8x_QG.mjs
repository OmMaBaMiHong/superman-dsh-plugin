import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as cache_default } from "./cache-DzpZriu0.mjs";
import { decodeHTML } from "entities";
//#region lib/routes/bilibili/live-room.ts
const route = {
	path: "/live/room/:roomID",
	categories: ["live"],
	example: "/bilibili/live/room/3",
	parameters: { roomID: "房间号, 可在直播间 URL 中找到, 长短号均可" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["live.bilibili.com/:roomID"] }],
	name: "直播开播",
	maintainers: ["Qixingchen"],
	handler
};
async function handler(ctx) {
	let roomID = ctx.req.param("roomID");
	if (Number(roomID) < 1e4) roomID = await cache_default.getLiveIDFromShortID(roomID);
	const info = await cache_default.getUserInfoFromLiveID(roomID);
	const data = (await rofetch(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomID}&from=room`, { headers: { Referer: `https://live.bilibili.com/${roomID}` } })).data;
	const liveItem = [];
	if (data.live_status === 1) liveItem.push({
		title: `${data.title} ${data.live_time}`,
		description: `<img src="${data.keyframe}"><br>${decodeHTML(data.description)}`,
		pubDate: timezone(parseDate(data.live_time), 8),
		guid: `https://live.bilibili.com/${roomID} ${data.live_time}`,
		link: `https://live.bilibili.com/${roomID}`
	});
	return {
		title: `${info.uname} 直播间开播状态`,
		link: `https://live.bilibili.com/${roomID}`,
		description: `${info.uname} 直播间开播状态`,
		image: info.face,
		item: liveItem,
		allowEmpty: true
	};
}
//#endregion
export { route };
