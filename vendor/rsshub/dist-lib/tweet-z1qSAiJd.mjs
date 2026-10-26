import { t as config } from "./config-B5Cf_tHS.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { n as api_default, t as utils_default } from "./utils-BZIs9uPz.mjs";
//#region lib/routes/twitter/tweet.ts
const route = {
	path: "/tweet/:id/status/:status/:original?",
	categories: ["social-media"],
	example: "/twitter/tweet/DIYgod/status/1650844643997646852",
	parameters: {
		id: "username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`",
		status: "tweet ID",
		original: "extra parameters, data type of return, if the value is not `0`/`false` and `config.isPackage` is `true`, return the original data of twitter"
	},
	features: {
		requireConfig: [],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Tweet Details",
	maintainers: ["LarchLiu", "Rongronggg9"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const status = ctx.req.param("status");
	const original = fallback(void 0, queryToBoolean(new URLSearchParams(ctx.req.param("original")).get("original")), false);
	const params = {
		focalTweetId: status,
		with_rux_injections: false,
		includePromotedContent: true,
		withCommunity: true,
		withQuickPromoteEligibilityTweetFields: true,
		withBirdwatchNotes: true,
		withVoice: true,
		withV2Timeline: true
	};
	await api_default.init();
	const userInfo = await api_default.getUser(id);
	const data = await api_default.getUserTweet(id, params);
	const profileImageUrl = userInfo.profile_image_url || userInfo.profile_image_url_https;
	const item = original && config.isPackage ? data : utils_default.ProcessFeed(ctx, { data });
	return {
		title: `Twitter @${userInfo.name}`,
		link: `https://x.com/${userInfo.screen_name}/status/${status}`,
		image: profileImageUrl.replace(/_normal.jpg$/, ".jpg"),
		description: userInfo.description,
		item
	};
}
//#endregion
export { route };
