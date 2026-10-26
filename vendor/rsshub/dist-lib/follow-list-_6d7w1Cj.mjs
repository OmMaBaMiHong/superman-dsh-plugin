import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-CFoQ464m.mjs";
import { t as cache_default } from "./cache-B6tqZTvR.mjs";
//#region lib/routes/mihoyo/bbs/follow-list.ts
const route = {
	path: "/bbs/follow-list/:uid",
	categories: ["game"],
	example: "/mihoyo/bbs/follow-list/77005350",
	parameters: { uid: "用户uid" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "米游社 - 用户关注",
	maintainers: ["CaoMeiYouRen"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const searchParams = {
		gids: 2,
		uid,
		page_size: ctx.req.query("limit") || "20"
	};
	const link = `https://www.miyoushe.com/ys/accountCenter/followList?id=${uid}`;
	const list = (await got_default({
		method: "get",
		url: "https://bbs-api.miyoushe.com/user/wapi/following",
		searchParams,
		headers: {
			Origin: "https://www.miyoushe.com",
			Referer: link
		}
	}))?.data?.data?.result;
	if (!list) throw new Error("未获取到数据！");
	const { nickname: username } = await cache_default.getUserFullInfo(ctx, uid);
	return {
		title: `米游社 - ${username} 的关注`,
		link,
		item: list.map((e) => {
			return {
				title: e.user.nickname,
				link: `https://www.miyoushe.com/ys/accountCenter/postList?id=${e.user.uid}`,
				description: renderDescription(`${e.user.certification.label || ""}\n${e.user.introduce || ""}`.trim(), [e.user.avatar_url])
			};
		})
	};
}
//#endregion
export { route };
