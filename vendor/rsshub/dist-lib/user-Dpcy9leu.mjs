import "./types-DNj6Etbg.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { n as api_default, t as utils_default } from "./utils-BZIs9uPz.mjs";
//#region lib/routes/twitter/user.ts
const route = {
	path: "/user/:id/:routeParams?",
	categories: ["social-media"],
	view: 1,
	example: "/twitter/user/_RSSHub",
	parameters: {
		id: "username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`",
		routeParams: "extra parameters, see the table above"
	},
	features: {
		requireConfig: [
			{
				name: "TWITTER_AUTH_TOKEN",
				description: "Please see above for details."
			},
			{
				name: "TWITTER_THIRD_PARTY_API",
				description: "Use third-party API to query twitter data",
				optional: true
			},
			{
				name: "TWITTER_CONSUMER_KEY",
				description: "Please see above for details."
			},
			{
				name: "TWITTER_CONSUMER_SECRET",
				description: "Please see above for details."
			}
		],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User timeline",
	maintainers: [
		"DIYgod",
		"yindaheng98",
		"Rongronggg9",
		"CaoMeiYouRen",
		"pseudoyu"
	],
	handler,
	radar: [{
		source: ["x.com/:id"],
		target: "/user/:id"
	}]
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const { count, include_replies, include_rts } = utils_default.parseRouteParams(ctx.req.param("routeParams"));
	const params = count ? { count } : {};
	await api_default.init();
	const userInfo = await api_default.getUser(id);
	let data;
	try {
		data = await (include_replies ? api_default.getUserTweetsAndReplies(id, params) : api_default.getUserTweets(id, params));
		if (!include_rts) data = utils_default.excludeRetweet(data);
	} catch (error) {
		logger.error(error);
	}
	const profileImageUrl = userInfo?.profile_image_url || userInfo?.profile_image_url_https;
	return {
		title: `Twitter @${userInfo?.name}`,
		link: `https://x.com/${userInfo?.screen_name}`,
		image: profileImageUrl.replace(/_normal.jpg$/, ".jpg"),
		description: userInfo?.description,
		item: data && utils_default.ProcessFeed(ctx, { data }),
		allowEmpty: true
	};
}
//#endregion
export { route };
