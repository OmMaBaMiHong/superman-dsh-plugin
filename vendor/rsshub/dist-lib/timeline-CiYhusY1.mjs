import { c as generateDynamicFeeds, d as LOGO_URL, m as REQUIRE_CONFIG, s as checkConfig, t as getFollowDynamicList, u as INDEX_URL } from "./api-DS_eRq73.mjs";
//#region lib/routes/sdo/ff14risingstones/timeline.ts
const route = {
	path: "/ff14risingstones/timeline",
	example: "/sdo/ff14risingstones/timeline",
	name: "时间线",
	categories: ["bbs"],
	maintainers: ["KarasuShin"],
	features: { requireConfig: REQUIRE_CONFIG },
	handler
};
async function handler(ctx) {
	checkConfig();
	const dynamics = await getFollowDynamicList(ctx.req.query("limit") || 20);
	return {
		title: "石之家 - 时间线",
		link: `${INDEX_URL}#/dynamic`,
		image: LOGO_URL,
		item: await generateDynamicFeeds(dynamics)
	};
}
//#endregion
export { route };
