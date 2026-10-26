import { d as LOGO_URL, f as POST_PART, l as generatePostFeeds, m as REQUIRE_CONFIG, n as getPosts, p as POST_TYPE, s as checkConfig, u as INDEX_URL } from "./api-DS_eRq73.mjs";
//#region lib/routes/sdo/ff14risingstones/posts.ts
const route = {
	path: "/ff14risingstones/posts/:pid?/:type?",
	example: "/sdo/ff14risingstones/posts/all/hot",
	name: "帖子",
	categories: ["bbs"],
	maintainers: ["KarasuShin"],
	features: { requireConfig: REQUIRE_CONFIG },
	parameters: {
		pid: {
			description: "分区id，默认显示所有分区，可通过 `,` 拼接多个分区 id 进行筛选",
			default: "all",
			options: [{
				label: "全部",
				value: "all"
			}, ...POST_PART]
		},
		type: {
			description: "帖文类型，默认不做筛选",
			options: [
				{
					label: "置顶",
					value: "top"
				},
				{
					label: "精华",
					value: "refine"
				},
				{
					label: "周热门",
					value: "hot"
				}
			]
		}
	},
	handler
};
async function handler(ctx) {
	checkConfig();
	const limit = ctx.req.query("limit") || 20;
	const pid = ctx.req.param("pid")?.split(",").filter((i) => POST_PART.some((part) => part.value === i)) ?? [];
	const type = ctx.req.param("type");
	const postPart = pid.length ? pid.map((i) => POST_PART.find((p) => p.value === i)?.label).join("，") : "";
	const posts = await getPosts({
		type: 1,
		limit,
		order: "latest",
		hotType: type === "hot" ? "postsHotWeek" : "postsHotNow",
		is_refine: type === "refine" ? 1 : 0,
		is_top: type === "top" ? 1 : 0,
		part_id: pid.length ? pid.join(",") : void 0
	});
	return {
		title: `石之家 - ${POST_TYPE[type] ?? ""}帖文${postPart ? ` - ${postPart}` : ""}`,
		link: `${INDEX_URL}#/post`,
		image: LOGO_URL,
		item: await generatePostFeeds(posts)
	};
}
//#endregion
export { route };
