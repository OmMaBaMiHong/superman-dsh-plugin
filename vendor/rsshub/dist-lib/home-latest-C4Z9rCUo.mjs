import { n as api_default, t as utils_default } from "./utils-BZIs9uPz.mjs";
//#region lib/routes/twitter/home-latest.ts
const route = {
	path: "/home_latest/:routeParams?",
	categories: ["social-media"],
	example: "/twitter/home_latest",
	features: {
		requireConfig: [{
			name: "TWITTER_AUTH_TOKEN",
			description: "Please see above for details."
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Home latest timeline",
	maintainers: ["DIYgod", "CaoMeiYouRen"],
	handler,
	radar: [{
		source: ["x.com/home"],
		target: "/home_latest"
	}]
};
async function handler(ctx) {
	const { count, include_rts, only_media } = utils_default.parseRouteParams(ctx.req.param("routeParams"));
	const params = count ? { count } : {};
	await api_default.init();
	let data = await api_default.getHomeLatestTimeline("", params);
	if (!include_rts) data = utils_default.excludeRetweet(data);
	if (only_media) data = utils_default.keepOnlyMedia(data);
	return {
		title: "Twitter following timeline",
		link: "https://x.com/home",
		item: utils_default.ProcessFeed(ctx, { data })
	};
}
//#endregion
export { route };
