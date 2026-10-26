import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as weiboUtils } from "./utils-L2Usa7U4.mjs";
import querystring from "node:querystring";
//#region lib/routes/weibo/group.ts
const route = {
	path: "/group/:gid/:gname?/:routeParams?",
	categories: ["social-media"],
	example: "/weibo/group/4541216424989965",
	parameters: {
		gid: "分组id, 在网页版分组地址栏末尾`?gid=`处获取",
		gname: "分组显示名称; 默认为: `微博分组`",
		routeParams: "额外参数；请参阅上面的说明和表格"
	},
	features: {
		requireConfig: [{
			name: "WEIBO_COOKIES",
			optional: true,
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "自定义分组",
	maintainers: ["monologconnor", "Rongronggg9"],
	handler,
	description: `::: warning
由于微博官方未提供自定义分组相关 api, 此方案必须使用用户\`Cookie\`进行抓取

因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知

微博用户 Cookie 的配置可参照部署文档
:::`
};
async function handler(ctx) {
	if (!config.weibo.cookies) throw new ConfigNotFoundError("Weibo Group Timeline is not available due to the absense of [Weibo Cookies]. Check <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config tutorial</a>");
	const gid = ctx.req.param("gid");
	const groupName = ctx.req.param("gname") || "微博分组";
	let displayVideo = "1";
	let displayArticle = "0";
	let displayComments = "0";
	if (ctx.req.param("routeParams")) if (ctx.req.param("routeParams") === "1" || ctx.req.param("routeParams") === "0") displayVideo = ctx.req.param("routeParams");
	else {
		const routeParams = querystring.parse(ctx.req.param("routeParams"));
		displayVideo = fallback(void 0, queryToBoolean(routeParams.displayVideo), true) ? "1" : "0";
		displayArticle = fallback(void 0, queryToBoolean(routeParams.displayArticle), false) ? "1" : "0";
		displayComments = fallback(void 0, queryToBoolean(routeParams.displayComments), false) ? "1" : "0";
	}
	const responseData = await cache_default.tryGet(`weibo:group:index:${gid}`, async () => {
		return (await got_default({
			method: "get",
			url: `https://m.weibo.cn/feed/group?gid=${gid}`,
			headers: {
				Referer: "https://m.weibo.cn/",
				Cookie: config.weibo.cookies,
				...weiboUtils.apiHeaders
			}
		})).data.data;
	}, config.cache.routeExpire, false);
	const resultItems = await Promise.all(responseData.statuses.map(async (item) => {
		const retweet = item.retweeted_status;
		if (retweet && retweet.isLongText) {
			const retweetData = await cache_default.tryGet(`weibo:retweeted:${retweet.user.id}:${retweet.bid}`, () => weiboUtils.getShowData(retweet.user.id, retweet.bid));
			if (retweetData !== void 0 && retweetData.text) item.retweeted_status.text = retweetData.text;
		}
		const formatExtended = weiboUtils.formatExtended(ctx, item);
		let description = formatExtended.description;
		if (displayVideo === "1") description = item.retweeted_status ? weiboUtils.formatVideo(description, item.retweeted_status) : weiboUtils.formatVideo(description, item);
		if (displayComments === "1") description = await weiboUtils.formatComments(ctx, description, item, "0");
		if (displayArticle === "1") description = await (item.retweeted_status ? weiboUtils.formatArticle(ctx, description, item.retweeted_status) : weiboUtils.formatArticle(ctx, description, item));
		return {
			...formatExtended,
			description
		};
	}));
	return weiboUtils.sinaimgTvax({
		title: groupName,
		link: `https://weibo.com/mygroups?gid=${gid}`,
		description: "微博自定义分组",
		item: resultItems
	});
}
//#endregion
export { route };
