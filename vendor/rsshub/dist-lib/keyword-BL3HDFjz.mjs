import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as weiboUtils } from "./utils-L2Usa7U4.mjs";
import querystring from "node:querystring";
//#region lib/routes/weibo/keyword.ts
const route = {
	path: "/keyword/:keyword/:routeParams?",
	categories: ["social-media"],
	view: 1,
	example: "/weibo/keyword/RSSHub",
	parameters: {
		keyword: "你想订阅的微博关键词",
		routeParams: "额外参数；请参阅上面的说明和表格"
	},
	features: {
		requireConfig: [{
			name: "WEIBO_COOKIES",
			optional: true,
			description: ""
		}],
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "关键词",
	maintainers: ["DIYgod", "Rongronggg9"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const data = await weiboUtils.tryWithCookies((cookies, verifier) => cache_default.tryGet(`weibo:keyword:${keyword}`, async () => {
		const _r = await got_default({
			method: "get",
			url: `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D61%26q%3D${encodeURIComponent(keyword)}%26t%3D0`,
			headers: {
				Referer: `https://m.weibo.cn/p/searchall?containerid=100103type%3D1%26q%3D${encodeURIComponent(keyword)}`,
				Cookie: cookies,
				...weiboUtils.apiHeaders
			}
		});
		verifier(_r);
		return _r.data.data.cards;
	}, config.cache.routeExpire, false));
	const routeParams = querystring.parse(ctx.req.param("routeParams"));
	return weiboUtils.sinaimgTvax({
		title: `又有人在微博提到${keyword}了`,
		link: `http://s.weibo.com/weibo/${encodeURIComponent(keyword)}&b=1&nodup=1`,
		description: `又有人在微博提到${keyword}了`,
		item: data.filter((i) => i.mblog).map((item) => {
			item.mblog.created_at = timezone(item.mblog.created_at, 8);
			if (item.mblog.retweeted_status && item.mblog.retweeted_status.created_at) item.mblog.retweeted_status.created_at = timezone(item.mblog.retweeted_status.created_at, 8);
			return weiboUtils.formatExtended(ctx, item.mblog, void 0, {
				showAuthorInTitle: fallback(void 0, queryToBoolean(routeParams.showAuthorInTitle), true),
				showAuthorInDesc: fallback(void 0, queryToBoolean(routeParams.showAuthorInDesc), true)
			});
		})
	});
}
//#endregion
export { route };
