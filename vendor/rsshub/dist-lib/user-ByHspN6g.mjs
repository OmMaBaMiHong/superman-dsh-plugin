import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { i as getBlog, r as blogBaseUrl, t as apiBaseUrl } from "./utils-CgRoscCG.mjs";
//#region lib/routes/oschina/user.ts
const route = {
	path: "/u/:uid",
	categories: ["programming"],
	example: "/oschina/u/3920392",
	parameters: { uid: "用户 id，可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["my.oschina.net/u/:uid", "my.oschina.net/:uid"] }],
	name: "用户博客",
	maintainers: ["dxmpalb"],
	handler
};
async function handler(ctx) {
	const { uid } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? 10);
	const isNumericId = /^\d+$/.test(uid);
	let userId = uid;
	if (!isNumericId) userId = (await cache_default.tryGet(`oschina:ident:${uid}`, async () => {
		return await rofetch(`${apiBaseUrl}/oschinapi/user/byIdent`, { query: { ident: uid } });
	})).result;
	const userDetail = await cache_default.tryGet(`oschina:user:${userId}`, async () => {
		return (await rofetch(`${apiBaseUrl}/oschinapi/user/userDetails`, { query: { userId } })).result;
	});
	const list = (await cache_default.tryGet(`oschina:user:${userId}:blogs`, async () => {
		return await rofetch(`${apiBaseUrl}/oschinapi/blog/otherUser/web`, { query: {
			userId,
			pageNum: 1,
			pageSize: limit
		} });
	}, config.cache.routeExpire, false)).result.list.map((item) => ({
		title: item.title,
		description: item.detail,
		link: `${blogBaseUrl}/u/${userId}/blog/${item.id}`,
		guid: `oschina:blog:${item.id}`,
		detailId: item.id,
		pubDate: timezone(parseDate(item.createTime), 8),
		author: item.userVo.name,
		image: item.imgUrl
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.guid, async () => {
		const response = await getBlog(item.detailId);
		item.description = response.code === 200 ? response.result.content : item.description;
		return item;
	})));
	return {
		title: `${userDetail.userVo.name}的博客`,
		description: userDetail.userVo.signature,
		link: userDetail.userVo.spaceUrl,
		image: userDetail.userVo.portraitUrl.replace("http://", "https://"),
		language: "zh-CN",
		item: items
	};
}
//#endregion
export { route };
