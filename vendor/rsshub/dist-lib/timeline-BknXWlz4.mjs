import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as cache_default } from "./cache-B6tqZTvR.mjs";
import { t as post2item } from "./utils-V7T3WS8w.mjs";
//#region lib/routes/mihoyo/bbs/timeline.ts
const route = {
	path: "/bbs/timeline",
	categories: ["game"],
	example: "/mihoyo/bbs/timeline",
	parameters: {},
	features: {
		requireConfig: [{
			name: "MIHOYO_COOKIE",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["miyoushe.com/:game/timeline"] }],
	name: "米游社 - 用户关注动态",
	maintainers: ["CaoMeiYouRen"],
	handler,
	description: `::: warning
用户关注动态需要米游社登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::`
};
async function handler(ctx) {
	if (!config.mihoyo.cookie) throw new ConfigNotFoundError("Miyoushe Timeline is not available due to the absense of [Miyoushe Cookie]. Check <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config tutorial</a>");
	const searchParams = {
		gids: 2,
		page_size: ctx.req.query("limit") || "20"
	};
	const link = "https://www.miyoushe.com/ys/timeline";
	const list = (await got_default({
		method: "get",
		url: "https://bbs-api.miyoushe.com/painter/wapi/timeline/list",
		searchParams,
		headers: {
			Referer: link,
			Cookie: config.mihoyo.cookie
		}
	}))?.data?.data?.list;
	if (!list) throw new Error("未获取到数据！");
	const { nickname: username } = await cache_default.getUserFullInfo(ctx, "");
	return {
		title: `米游社 - ${username} 的关注动态`,
		link,
		item: list.map((e) => post2item(e))
	};
}
//#endregion
export { route };
