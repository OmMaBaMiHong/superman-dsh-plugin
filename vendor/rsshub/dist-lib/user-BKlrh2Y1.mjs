import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as weiboUtils } from "./utils-L2Usa7U4.mjs";
import querystring from "node:querystring";
//#region lib/routes/weibo/user.ts
const route = {
	path: "/user/:uid/:routeParams?",
	categories: ["social-media"],
	view: 1,
	example: "/weibo/user/1195230310",
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
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["m.weibo.cn/u/:uid", "m.weibo.cn/profile/:uid"],
			target: "/user/:uid"
		},
		{
			source: ["weibo.com/u/:uid"],
			target: "/user/:uid"
		},
		{
			source: ["www.weibo.com/u/:uid"],
			target: "/user/:uid"
		}
	],
	name: "博主",
	maintainers: [
		"DIYgod",
		"iplusx",
		"Rongronggg9",
		"Konano"
	],
	handler,
	description: `::: warning
部分博主仅登录可见，未提供 Cookie 的情况下不支持订阅，可以通过打开 \`https://m.weibo.cn/u/:uid\` 验证
:::`
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	let displayVideo = "1";
	let displayArticle = "0";
	let displayComments = "0";
	let showRetweeted = "1";
	let showBloggerIcons = "0";
	if (ctx.req.param("routeParams")) if (ctx.req.param("routeParams") === "1" || ctx.req.param("routeParams") === "0") displayVideo = ctx.req.param("routeParams");
	else {
		const routeParams = querystring.parse(ctx.req.param("routeParams"));
		displayVideo = fallback(void 0, queryToBoolean(routeParams.displayVideo), true) ? "1" : "0";
		displayArticle = fallback(void 0, queryToBoolean(routeParams.displayArticle), false) ? "1" : "0";
		displayComments = fallback(void 0, queryToBoolean(routeParams.displayComments), false) ? "1" : "0";
		showRetweeted = fallback(void 0, queryToBoolean(routeParams.showRetweeted), false) ? "1" : "0";
		showBloggerIcons = fallback(void 0, queryToBoolean(routeParams.showBloggerIcons), false) ? "1" : "0";
	}
	const containerData = await weiboUtils.tryWithCookies((cookies, verifier) => cache_default.tryGet(`weibo:user:index:${uid}`, async () => {
		const _r = await got_default({
			method: "get",
			url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
			headers: {
				Referer: `https://m.weibo.cn/u/${uid}`,
				Cookie: cookies,
				...weiboUtils.apiHeaders
			}
		});
		verifier(_r);
		return _r.data;
	}, config.cache.routeExpire, false));
	const name = containerData.data.userInfo.screen_name;
	const description = containerData.data.userInfo.description;
	const profileImageUrl = containerData.data.userInfo.profile_image_url;
	const containerId = containerData.data.tabsInfo.tabs.find((item) => item.tab_type === "weibo").containerid;
	const cards = await weiboUtils.tryWithCookies((cookies, verifier) => cache_default.tryGet(`weibo:user:cards:${uid}:${containerId}`, async () => {
		const _r = await got_default({
			method: "get",
			url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=${containerId}`,
			headers: {
				Referer: `https://m.weibo.cn/u/${uid}`,
				Cookie: cookies,
				...weiboUtils.apiHeaders
			}
		});
		verifier(_r);
		return _r.data.data.cards;
	}, config.cache.routeExpire, false));
	let resultItems = await Promise.all(cards.filter((item) => {
		if (item.mblog === void 0) return false;
		return !(showRetweeted === "0" && item.mblog.retweeted_status);
	}).map(async (item) => {
		let { bid } = item.mblog;
		const { retweeted_status, created_at } = item.mblog;
		if (bid === "") {
			bid = new URL(item.scheme).searchParams.get("mblogid");
			item.mblog.bid = bid;
		}
		const key = `weibo:user:${bid}`;
		const data = await cache_default.tryGet(key, () => weiboUtils.getShowData(uid, bid));
		if (data && data.text) {
			item.mblog.text = data.text;
			item.mblog.created_at = parseDate(data.created_at);
			item.mblog.pics = data.pics;
			if (retweeted_status && data.retweeted_status) retweeted_status.created_at = data.retweeted_status.created_at;
		} else item.mblog.created_at = timezone(created_at, 8);
		const retweet = retweeted_status;
		if (retweet && retweet.isLongText) {
			const retweetData = await cache_default.tryGet(`weibo:retweeted:${retweet.user.id}:${retweet.bid}`, () => weiboUtils.getShowData(retweet.user.id, retweet.bid));
			if (retweetData !== void 0 && retweetData.text) retweeted_status.text = retweetData.text;
		}
		const formatExtended = weiboUtils.formatExtended(ctx, item.mblog, uid);
		let description = formatExtended.description;
		if (displayVideo === "1") description = retweeted_status ? weiboUtils.formatVideo(description, retweeted_status) : weiboUtils.formatVideo(description, item.mblog);
		if (displayComments === "1") description = await weiboUtils.formatComments(ctx, description, item.mblog, showBloggerIcons);
		if (displayArticle === "1") description = await (retweeted_status ? weiboUtils.formatArticle(ctx, description, retweeted_status) : weiboUtils.formatArticle(ctx, description, item.mblog));
		return {
			...formatExtended,
			description,
			isPinned: item.profile_type_id?.startsWith("proweibotop")
		};
	}));
	const pinnedItems = resultItems.filter((item) => item.isPinned);
	const ordinaryItems = resultItems.filter((item) => !item.isPinned);
	if (pinnedItems.length > 0 && ordinaryItems.length > 0) {
		const earliestOrdinaryPostTime = Math.min(...ordinaryItems.map((i) => i.pubDate).filter(Boolean));
		resultItems = ordinaryItems;
		for (const item of pinnedItems) if (item.pubDate > earliestOrdinaryPostTime) resultItems.unshift(item);
	}
	return weiboUtils.sinaimgTvax({
		title: `${name}的微博`,
		link: `https://weibo.com/${uid}/`,
		description,
		image: profileImageUrl,
		item: resultItems,
		allowEmpty: true
	});
}
//#endregion
export { route };
