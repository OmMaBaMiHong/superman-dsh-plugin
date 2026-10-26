import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as weiboUtils } from "./utils-L2Usa7U4.mjs";
import querystring from "node:querystring";
//#region lib/routes/weibo/user-bookmarks.ts
const route = {
	path: "/user_bookmarks/:uid/:routeParams?",
	categories: ["social-media"],
	example: "/weibo/user_bookmarks/1195230310",
	parameters: {
		uid: "用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取",
		routeParams: "额外参数；请参阅上面的说明和表格；特别地，当 `routeParams=1` 时开启微博视频显示"
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
	radar: [{
		source: ["weibo.com/"],
		target: "/user_bookmarks/:uid"
	}],
	name: "用户收藏动态",
	maintainers: ["cztchoice"],
	handler,
	url: "weibo.com/",
	description: `::: warning
此方案必须使用用户\`Cookie\`进行抓取，只可以获取本人的收藏动态

因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知

微博用户 Cookie 的配置可参照部署文档
:::`
};
async function handler(ctx) {
	if (!config.weibo.cookies) throw new ConfigNotFoundError("Weibo user bookmarks is not available due to the absense of [Weibo Cookies]. Check <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config tutorial</a>");
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
	const uid = await cache_default.tryGet("weibo:user_bookmarks:login-user", async () => {
		return (await got_default({
			method: "get",
			url: "https://m.weibo.cn/api/config",
			headers: {
				Referer: "https://m.weibo.cn/",
				Cookie: config.weibo.cookies,
				...weiboUtils.apiHeaders
			}
		})).data.data.uid;
	}, config.cache.routeExpire, false);
	const containerData = await cache_default.tryGet(`weibo:user_bookmarks:index:${uid}`, async () => {
		return (await got_default({
			method: "get",
			url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
			headers: {
				Referer: `https://m.weibo.cn/u/${uid}`,
				Cookie: config.weibo.cookies,
				...weiboUtils.apiHeaders
			}
		})).data;
	}, config.cache.routeExpire, false);
	const title = `${containerData.data.userInfo.screen_name} 的 最新收藏时间线`;
	const schemeString = containerData.data.scheme;
	const url = new URL(`http://example.com/${schemeString.replace("://", "?")}`);
	const bookmarkContainerId = new URLSearchParams(url.search).get("lfid");
	const cards = await cache_default.tryGet(`weibo:user_bookmarks:cards:${uid}`, async () => {
		return (await got_default({
			method: "get",
			url: `https://m.weibo.cn/api/container/getIndex?containerid=${bookmarkContainerId}&openApp=0`,
			headers: {
				Referer: "https://m.weibo.cn/",
				Cookie: config.weibo.cookies,
				...weiboUtils.apiHeaders
			}
		})).data.data.cards;
	}, config.cache.routeExpire, false);
	const resultItems = await Promise.all(cards.filter((item) => item.mblog).map(async (item) => {
		const key = "weibo:user_bookmarks:" + item.mblog.bid;
		const data = await cache_default.tryGet(key, () => weiboUtils.getShowData(uid, item.mblog.bid));
		if (data?.text) {
			item.mblog.text = data.text;
			item.mblog.created_at = parseDate(data.created_at);
			item.mblog.pics = data.pics;
			if (item.mblog.retweeted_status && data.retweeted_status) item.mblog.retweeted_status.created_at = data.retweeted_status.created_at;
		} else item.mblog.created_at = timezone(item.mblog.created_at, 8);
		const retweet = item.mblog.retweeted_status;
		if (retweet?.isLongText) {
			const retweetData = await cache_default.tryGet(`weibo:retweeted:${retweet.user.id}:${retweet.bid}`, () => weiboUtils.getShowData(retweet.user.id, retweet.bid));
			if (retweetData !== void 0 && retweetData.text) item.mblog.retweeted_status.text = retweetData.text;
		}
		const formatExtended = weiboUtils.formatExtended(ctx, item.mblog, uid);
		let description = formatExtended.description;
		if (displayVideo === "1") description = item.mblog.retweeted_status ? weiboUtils.formatVideo(description, item.mblog.retweeted_status) : weiboUtils.formatVideo(description, item.mblog);
		if (displayComments === "1") description = await weiboUtils.formatComments(ctx, description, item.mblog, "0");
		if (displayArticle === "1") description = await (item.mblog.retweeted_status ? weiboUtils.formatArticle(ctx, description, item.mblog.retweeted_status) : weiboUtils.formatArticle(ctx, description, item.mblog));
		return {
			...formatExtended,
			description
		};
	}));
	return weiboUtils.sinaimgTvax({
		title,
		link: "https://weibo.com",
		item: resultItems
	});
}
//#endregion
export { route };
