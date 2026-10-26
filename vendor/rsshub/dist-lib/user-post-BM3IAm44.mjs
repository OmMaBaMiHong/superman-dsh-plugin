import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as post2item } from "./utils-V7T3WS8w.mjs";
//#region lib/routes/mihoyo/bbs/user-post.ts
const route = {
	path: "/bbs/user-post/:uid",
	categories: ["game"],
	example: "/mihoyo/bbs/user-post/77005350",
	parameters: { uid: "用户uid" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "米游社 - 用户帖子",
	maintainers: ["CaoMeiYouRen"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const searchParams = {
		uid,
		size: ctx.req.query("limit") || "20"
	};
	const link = `https://www.miyoushe.com/ys/accountCenter/postList?id=${uid}`;
	const list = (await got_default({
		method: "get",
		url: "https://bbs-api.miyoushe.com/post/wapi/userPost",
		searchParams
	}))?.data?.data?.list;
	if (!list) throw new Error("未获取到数据！");
	return {
		title: `米游社 - ${list[0]?.user.nickname} 的发帖`,
		link,
		item: list.map((e) => post2item(e))
	};
}
//#endregion
export { route };
