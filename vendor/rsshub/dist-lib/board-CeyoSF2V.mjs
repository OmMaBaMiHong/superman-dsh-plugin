import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { a as webBaseUrl, i as sign, n as getPost, r as phoneBaseUrl, t as generateNonce } from "./utils-B52A5pJi.mjs";
//#region lib/routes/dxy/board.ts
const route = {
	path: "/bbs/board/:boardId",
	categories: ["bbs"],
	example: "/dxy/bbs/board/46",
	parameters: { specialId: "板块 ID，可在对应板块页 URL 中找到" },
	name: "板块",
	maintainers: ["TonyRL"],
	radar: [{
		source: ["www.dxy.cn/bbs/newweb/pc/category/:boardIdId"],
		target: "/bbs/board/:boardIdId"
	}, {
		source: ["3g.dxy.cn/bbs/board/:boardIdId"],
		target: "/bbs/board/:boardIdId"
	}],
	handler
};
async function handler(ctx) {
	const { boardId } = ctx.req.param();
	const { limit = "20" } = ctx.req.query();
	const boardDetail = await cache_default.tryGet(`dxy:board:detail:${boardId}`, async () => {
		const detailParams = {
			boardId,
			timestamp: Date.now(),
			noncestr: generateNonce(8, "number")
		};
		const detail = await rofetch(`${phoneBaseUrl}/bbsapi/bbs/board/detail`, { query: {
			...detailParams,
			sign: sign(detailParams)
		} });
		if (detail.code !== "success") throw new Error(detail.message);
		return detail.data;
	});
	const list = (await cache_default.tryGet(`dxy:board:list:${boardId}`, async () => {
		const listParams = {
			boardId,
			postType: "0",
			orderType: "1",
			pageNum: "1",
			pageSize: limit,
			timestamp: Date.now(),
			noncestr: generateNonce(8, "number")
		};
		const recommendList = await rofetch(`${phoneBaseUrl}/bbsapi/bbs/board/post/list`, { query: {
			...listParams,
			sign: sign(listParams)
		} });
		if (recommendList.code !== "success") throw new Error(recommendList.message);
		return recommendList.data;
	}, config.cache.routeExpire, false)).result.map((item) => ({
		title: item.subject,
		author: item.postUser.nickname,
		category: [boardDetail.title],
		link: `${webBaseUrl}/bbs/newweb/pc/post/${item.postId}`,
		postId: item.postId
	}));
	const items = await Promise.all(list.map((item) => getPost(item)));
	return {
		title: boardDetail.title,
		description: `${boardDetail.postCount} 內容 ${boardDetail.followCount} 关注`,
		link: `${webBaseUrl}/bbs/newweb/pc/category/${boardId}`,
		image: boardDetail.boardAvatar,
		item: items
	};
}
//#endregion
export { route };
