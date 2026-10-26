import { a as getUserInfo, c as generateDynamicFeeds, i as getUserDynamic, m as REQUIRE_CONFIG, s as checkConfig, u as INDEX_URL } from "./api-DS_eRq73.mjs";
//#region lib/routes/sdo/ff14risingstones/user-dynamics.ts
const route = {
	path: "/ff14risingstones/user-dynamics/:uid",
	example: "/sdo/ff14risingstones/user-dynamics/10001226",
	name: "用户动态",
	categories: ["bbs"],
	maintainers: ["KarasuShin"],
	features: { requireConfig: REQUIRE_CONFIG },
	handler
};
async function handler(ctx) {
	checkConfig();
	const uid = ctx.req.param("uid");
	const [dynamics, userInfo] = await Promise.all([getUserDynamic(uid), getUserInfo(uid)]);
	return {
		title: `石之家 - ${userInfo.character_name}@${userInfo.group_name} 的动态`,
		link: `${INDEX_URL}#/me/dynamics?uuid=${uid}`,
		image: userInfo.avatar,
		item: await generateDynamicFeeds(dynamics)
	};
}
//#endregion
export { route };
