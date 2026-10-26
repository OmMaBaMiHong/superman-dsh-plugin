import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { a as getUserInfo, m as REQUIRE_CONFIG, r as getResently, s as checkConfig, u as INDEX_URL } from "./api-DS_eRq73.mjs";
//#region lib/routes/sdo/ff14risingstones/user-resently.ts
const route = {
	path: "/ff14risingstones/user-resently/:uid",
	categories: ["bbs"],
	example: "/sdo/ff14risingstones/user-resently/10008214",
	name: "游戏近况",
	maintainers: ["KarasuShin"],
	features: { requireConfig: REQUIRE_CONFIG },
	handler
};
async function handler(ctx) {
	checkConfig();
	const uid = ctx.req.param("uid");
	const [resently, userInfo] = await Promise.all([getResently(uid), getUserInfo(uid)]);
	return {
		title: `石之家 - ${userInfo.character_name}@${userInfo.group_name} 的游戏近况`,
		link: `${INDEX_URL}#/me/info?uuid=${uid}`,
		image: userInfo.avatar,
		item: resently.map((i) => ({
			title: `${i.event_type} - ${i.detail}`,
			pubDate: timezone(parseDate(i.log_time), 8),
			guid: `sdo/ff14risingstones/resently:${uid}-${i.detail}`
		}))
	};
}
//#endregion
export { route };
