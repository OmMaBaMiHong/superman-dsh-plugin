import { a as getTagInfo, i as getPosts, n as SUB_URL } from "./utils-BfhaY54R.mjs";
//#region lib/routes/8kcos/tag.ts
const route = {
	path: "/tag/:tag",
	categories: ["picture"],
	example: "/8kcos/tag/cosplay",
	parameters: { tag: "标签名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["8kcosplay.com/tag/:tag"] }],
	name: "标签",
	maintainers: ["KotoriK"],
	handler,
	url: "8kcosplay.com/"
};
async function handler(ctx) {
	const limit = Number(ctx.req.query("limit") ?? 10);
	const tag = ctx.req.param("tag");
	const tagInfo = await getTagInfo(tag);
	const items = await getPosts(limit, { tags: tagInfo.id });
	return {
		title: tagInfo.title,
		link: `${SUB_URL}/tag/${tag}/`,
		item: items
	};
}
//#endregion
export { route };
