import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { a as webBaseUrl, i as sign, n as getPost, r as phoneBaseUrl, t as generateNonce } from "./utils-B52A5pJi.mjs";
//#region lib/routes/dxy/special.ts
const route = {
	path: "/bbs/special/:specialId",
	categories: ["bbs"],
	example: "/dxy/bbs/special/72",
	parameters: { specialId: "专题 ID，可在对应专题页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "专题",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const specialId = ctx.req.param("specialId");
	const { limit = "10" } = ctx.req.query();
	const specialDetail = await cache_default.tryGet(`dxy:special:detail:${specialId}`, async () => {
		const detailParams = {
			specialId,
			requestType: "h5",
			timestamp: Date.now(),
			noncestr: generateNonce(8, "number")
		};
		const detail = await rofetch(`${phoneBaseUrl}/newh5/bbs/special/detail`, { query: {
			...detailParams,
			sign: sign(detailParams)
		} });
		if (detail.code !== "success") throw new Error(detail.message);
		return detail.data;
	});
	const list = (await cache_default.tryGet(`dxy:special:recommend-list-v3:${specialId}`, async () => {
		const listParams = {
			specialId,
			requestType: "h5",
			pageNum: "1",
			pageSize: limit,
			timestamp: Date.now(),
			noncestr: generateNonce(8, "number")
		};
		const recommendList = await rofetch(`${phoneBaseUrl}/newh5/bbs/special/post/recommend-list-v3`, { query: {
			...listParams,
			sign: sign(listParams)
		} });
		if (recommendList.code !== "success") throw new Error(recommendList.message);
		return recommendList.data;
	}, config.cache.routeExpire, false)).result.map((item) => {
		const { postInfo, dataTime, entityId } = item;
		return {
			title: postInfo.subject,
			description: postInfo.simpleBody,
			pubDate: parseDate(dataTime, "x"),
			author: postInfo.postUser.nickname,
			category: [postInfo.postSpecial.specialName],
			link: `${webBaseUrl}/bbs/newweb/pc/post/${entityId}`,
			postId: entityId
		};
	});
	const items = await Promise.all(list.map((item) => getPost(item)));
	return {
		title: specialDetail.name,
		description: `${specialDetail.content} ${specialDetail.postCount} 內容 ${specialDetail.followCount} 关注`,
		link: `${phoneBaseUrl}/bbs/special?specialId=${specialId}`,
		image: specialDetail.specialAvatar,
		item: items
	};
}
//#endregion
export { route };
