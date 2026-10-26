import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/hypergryph/arknights/announce.ts
const route = {
	path: "/arknights/announce/:platform?/:group?",
	categories: ["game"],
	example: "/hypergryph/arknights/announce",
	parameters: {
		platform: "平台，默认为 Android",
		group: "分组，默认为 ALL"
	},
	name: "明日方舟 - 游戏内公告",
	maintainers: ["swwind"],
	handler,
	description: `平台

|  安卓服 | iOS 服 |   B 服   |
| :-----: | :----: | :------: |
| Android |   IOS  | Bilibili |

分组

| 全部 | 系统公告 | 活动公告 |
| :--: | :------: | :------: |
|  ALL |  SYSTEM  | ACTIVITY |`
};
async function handler(ctx) {
	const { platform = "Android", group = "ALL" } = ctx.req.param();
	let announceList = await cache_default.tryGet(`hypergryph:arknights:announce_meta:${platform}`, async () => {
		const { announceList } = await rofetch(`https://ak-conf.hypergryph.com/config/prod/announce_meta/${platform}/announcement.meta.json`);
		return announceList;
	}, config.cache.routeExpire, false);
	if (group !== "ALL") announceList = announceList.filter((item) => item.group === group);
	const items = await Promise.all(announceList.map((item) => cache_default.tryGet(item.webUrl, async () => {
		const $ = load(await rofetch(item.webUrl));
		let description = $(".content").html() ?? $(".banner-image-container.cover").html() ?? "No Description";
		description = description.replace(/href="uniwebview:\/\/.+?"/, "href=\"#\"");
		return {
			title: item.title,
			description,
			pubDate: parseDate(`${item.month}-${item.day}`, "M-D"),
			link: item.webUrl
		};
	})));
	return {
		title: `《明日方舟》${group === "SYSTEM" ? "系统" : group === "ACTIVITY" ? "活动" : "全部"}公告`,
		link: "https://ak.hypergryph.com/",
		item: items
	};
}
//#endregion
export { route };
