import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/xiaoyuzhou/pickup.ts
const XIAOYUZHOU_ITEMS = "xiaoyuzhou_items";
const isToday = (date) => {
	date = new Date(date);
	const today = /* @__PURE__ */ new Date();
	return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};
const ProcessFeed = async () => {
	const device_id = config.xiaoyuzhou.device_id || "f5d56d9a-8530-49a4-a6d2-cfb4b7a31240";
	const refresh_token = await cache_default.get("XIAOYUZHOU_TOKEN") || config.xiaoyuzhou.refresh_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiVzhieXB2dTJtT24xZWNqcEppN2p6R2xhMDBhMHYxellLaHFcL0ZXVWVkdDcxNlh3bnJnOFE0cFpGbVJmVFJQQ29ESWsxMmVuY3RcLzNqQWNjeFU3aTZNbkM4MUtWcUlmWWJJbVBKdXJDTXVYc1dHa2x0SE5TK3llNnJvTldLSWN1M1ZFTGY5WFE0cGhnK2crQld6bFloM2g0VUtONlNKWWlUSGtkaHowd0RJYXIrdTlzOE5PaEJPYXdJXC80NEFZcW41RjJqUXNnU3o1TExDSGtuTENuUFppRXllaTNwcVFwRkgweWFWbk03bmQ2RFhrUmVmUExVMTVpMXcwRnpkXC9wWDEiLCJ2IjozLCJpdiI6IkJiVGFjXC9KTG9BU1NYY0tPMkk3M0JBPT0iLCJpYXQiOjE1OTQ1NzIyOTEuODE2fQ.aQm7A6A1R3P94s88vWBWTbIeek9nJ-q9ztfCB7o1uK0";
	const headers = {
		applicationid: "app.podcast.cosmos",
		"app-version": "1.6.0",
		"x-jike-device-id": device_id,
		"user-agent": "okhttp/4.7.2"
	};
	const token_updated = await got_default({
		method: "post",
		url: "https://api.xiaoyuzhoufm.com/app_auth_tokens.refresh",
		headers: {
			...headers,
			"x-jike-refresh-token": refresh_token
		}
	});
	cache_default.set("XIAOYUZHOU_TOKEN", token_updated.data["x-jike-refresh-token"]);
	const data = (await got_default({
		method: "post",
		url: "https://api.xiaoyuzhoufm.com/v1/editor-pick/list",
		headers: {
			...headers,
			"x-jike-access-token": token_updated.data["x-jike-access-token"]
		}
	})).data.data;
	const playList = [];
	for (const dailyPicks of data) {
		const pubDate = (/* @__PURE__ */ new Date(dailyPicks.date + " 00:00:00 +0800")).toUTCString();
		for (const pick of dailyPicks.picks) {
			pick.pubDate = pubDate;
			playList.push(pick);
		}
	}
	return playList.map((item) => {
		const title = item.episode.title + " - " + item.episode.podcast.title;
		const eid = item.episode.eid;
		const itunes_item_image = item.episode.image ? item.episode.image.picUrl : item.episode.podcast.image ? item.episode.podcast.image.picUrl : "";
		const link = `https://www.xiaoyuzhoufm.com/episode/${eid}`;
		const pubDate = item.pubDate;
		const itunes_duration = item.episode.duration;
		const enclosure_url = item.episode.enclosure.url;
		return {
			title,
			description: `<p><strong>${item.comment.author.nickname}：</strong>${item.comment.text}</p><hr>` + item.episode.shownotes,
			link,
			author: item.episode.podcast.author,
			pubDate,
			enclosure_url,
			itunes_duration,
			itunes_item_image,
			enclosure_type: "audio/mpeg"
		};
	});
};
const route = {
	path: "/",
	radar: [{
		source: ["xiaoyuzhoufm.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["prnake", "Maecenas"],
	handler,
	url: "xiaoyuzhoufm.com/"
};
async function handler() {
	let resultItems = await cache_default.tryGet(XIAOYUZHOU_ITEMS, () => ProcessFeed());
	if (!isToday(resultItems[0].pubDate)) {
		resultItems = await ProcessFeed();
		cache_default.set(XIAOYUZHOU_ITEMS, resultItems);
	}
	return {
		title: "小宇宙 - 发现",
		link: "https://www.xiaoyuzhoufm.com/",
		description: "小宇宙的编辑精选",
		image: "https://www.xiaoyuzhoufm.com/apple-touch-icon.png",
		itunes_author: "小宇宙",
		itunes_category: "Society & Culture",
		item: resultItems
	};
}
//#endregion
export { route };
