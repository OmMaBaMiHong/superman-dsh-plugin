import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { r as getOriginAvatar } from "./utils-aoskalbv.mjs";
//#region lib/routes/douyin/live.ts
const route = {
	path: "/live/:rid",
	categories: ["live"],
	example: "/douyin/live/685317364746",
	parameters: { rid: "直播间 id, 可在主播直播间页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["live.douyin.com/:rid"] }],
	name: "直播间开播",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const rid = ctx.req.param("rid");
	if (Number.isNaN(rid)) throw new InvalidParameterError("Invalid room ID. Room ID should be a number.");
	const pageUrl = `https://live.douyin.com/${rid}`;
	const renderData = await cache_default.tryGet(`douyin:live:${rid}`, async () => {
		let roomInfo;
		const context = await outPlaywright();
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "stylesheet" || request.resourceType() === "script" || request.resourceType() === "xhr" ? route.continue() : route.abort();
		});
		page.on("response", async (response) => {
			if (response.request().url().includes("/webcast/room/web/enter")) roomInfo = await response.json();
		});
		logger.http(`Requesting ${pageUrl}`);
		await page.goto(pageUrl, { waitUntil: "networkidle" });
		await context.close();
		return roomInfo;
	}, config.cache.routeExpire, false);
	if (renderData.status_code !== 0) throw new Error(`Status code ${renderData.status_code}`);
	const roomInfo = renderData.data.data[0];
	const roomOwner = renderData.data.user;
	const nickname = roomOwner.nickname;
	const userAvatar = roomOwner.avatar_thumb.url_list[0];
	const items = [];
	if (roomInfo.id_str) {
		if (roomInfo.status === 2) items.push({
			title: `开播：${roomInfo.title}`,
			description: `<img src="${roomInfo.cover.url_list[0]}">`,
			link: pageUrl,
			author: nickname,
			guid: roomInfo.id_str
		});
		else if (roomInfo.status === 4) items.push({
			title: `当前直播已结束，期待下一场：${roomInfo.title}`,
			link: `https://www.douyin.com/user/${roomOwner.sec_uid}`,
			author: nickname,
			guid: roomInfo.id_str
		});
	}
	return {
		title: `${nickname}的抖音直播间 - 抖音直播`,
		description: `欢迎来到${nickname}的抖音直播间，${nickname}与大家一起记录美好生活 - 抖音直播`,
		image: getOriginAvatar(userAvatar),
		link: pageUrl,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
