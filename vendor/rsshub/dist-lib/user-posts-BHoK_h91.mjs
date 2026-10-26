import { a as getUserInfo, l as generatePostFeeds, m as REQUIRE_CONFIG, o as getUserPosts, s as checkConfig, u as INDEX_URL } from "./api-DS_eRq73.mjs";
//#region lib/routes/sdo/ff14risingstones/user-posts.ts
const route = {
	path: "/ff14risingstones/user-posts/:uid",
	example: "/sdo/ff14risingstones/user-posts/10001226",
	name: "用户发帖",
	categories: ["bbs"],
	maintainers: ["KarasuShin"],
	features: { requireConfig: REQUIRE_CONFIG },
	handler
};
async function handler(ctx) {
	checkConfig();
	const uid = ctx.req.param("uid");
	const [posts, userInfo] = await Promise.all([getUserPosts(uid, 1), getUserInfo(uid)]);
	return {
		title: `石之家 - ${userInfo.character_name}@${userInfo.group_name} 发布的帖子`,
		link: `${INDEX_URL}#/me/posts?uuid=${uid}`,
		image: userInfo.avatar,
		item: await generatePostFeeds(posts)
	};
}
//#endregion
export { route };
