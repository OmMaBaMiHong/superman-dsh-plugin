import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as webBaseUrl, i as sign, n as getPost, t as generateNonce } from "./utils-B52A5pJi.mjs";
//#region lib/routes/dxy/profile/thread.ts
const route = {
	path: "/bbs/profile/thread/:userId",
	categories: ["bbs"],
	example: "/dxy/bbs/profile/thread/8335054",
	parameters: { userId: "个人 ID，可在 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dxy.cn/bbs/newweb/pc/profile/:userId/threads", "dxy.cn/bbs/newweb/pc/profile/:userId"] }],
	name: "个人帖子",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const userId = ctx.req.param("userId");
	const { limit = "30" } = ctx.req.query();
	const userInfo = await cache_default.tryGet(`dxy:user-info:${userId}`, async () => {
		const userInfoParams = {
			userId,
			serverTimestamp: Date.now(),
			timestamp: Date.now(),
			noncestr: generateNonce(8, "number")
		};
		const { data: userInfo } = await got_default(`${webBaseUrl}/bbs/newweb/personal-page/user-info`, { searchParams: {
			...userInfoParams,
			sign: sign(userInfoParams)
		} });
		if (userInfo.code !== "success") throw new Error(userInfo.message);
		return userInfo.data;
	});
	const list = (await cache_default.tryGet(`dxy:user:post:${userId}`, async () => {
		const postListParams = {
			userId,
			type: "0",
			pageNum: "1",
			pageSize: limit,
			serverTimestamp: Date.now(),
			timestamp: Date.now(),
			noncestr: generateNonce(8, "number")
		};
		const { data: postList } = await got_default(`${webBaseUrl}/bbs/newweb/user/post/page`, { searchParams: {
			...postListParams,
			sign: sign(postListParams)
		} });
		if (postList.code !== "success") throw new Error(postList.message);
		return postList.data;
	}, config.cache.routeExpire, false)).result.map((item) => {
		const { postInfo, createdTime, entityId } = item;
		return {
			title: postInfo.subject,
			description: postInfo.simpleBody,
			pubDate: parseDate(createdTime, "x"),
			author: postInfo.postUser.nickname,
			category: [postInfo.boardInfo.title],
			link: `${webBaseUrl}/bbs/newweb/pc/post/${entityId}`,
			postId: entityId
		};
	});
	const items = await Promise.all(list.map((item) => getPost(item)));
	return {
		title: `${userInfo.nickname} 的个人主页 - 丁香园论坛 - 专业医生社区，医学、药学、生命科学、科研学术交流`,
		description: `${userInfo.identificationTitle} ${userInfo.signature}`,
		link: `${webBaseUrl}/bbs/newweb/pc/profile/${userId}/threads`,
		image: userInfo.avatar,
		item: items
	};
}
//#endregion
export { route };
