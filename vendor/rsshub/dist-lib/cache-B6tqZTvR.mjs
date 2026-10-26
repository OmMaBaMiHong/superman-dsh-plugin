import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default$1 } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/mihoyo/bbs/cache.ts
const getUserFullInfo = (ctx, uid) => {
	if (!uid && !config.mihoyo.cookie) throw new ConfigNotFoundError("GetUserFullInfo is not available due to the absense of [Miyoushe Cookie]. Check <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config tutorial</a>");
	uid ||= "";
	const key = "mihoyo:user-full-info-uid-" + uid;
	return cache_default$1.tryGet(key, async () => {
		const userInfo = (await got_default({
			method: "get",
			url: `https://bbs-api.miyoushe.com/user/wapi/getUserFullInfo?${new URLSearchParams({
				uid,
				gids: 2
			}).toString()}`,
			headers: {
				Referer: `https://www.miyoushe.com/ys/accountCenter/postList?id=${uid}`,
				Cookie: config.mihoyo.cookie
			}
		}))?.data?.data?.user_info;
		if (!userInfo) throw new Error("未获取到数据！");
		const { nickname, introduce, gender, certification, avatar_url, uid: userId } = userInfo;
		return {
			nickname,
			introduce,
			gender,
			certification,
			avatar_url,
			uid: userId
		};
	});
};
var cache_default = { getUserFullInfo };
//#endregion
export { cache_default as t };
