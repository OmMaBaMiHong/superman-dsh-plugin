import { n as api_default, t as utils_default } from "./utils-BZIs9uPz.mjs";
//#region lib/routes/twitter/likes.ts
const route = {
	path: "/likes/:id/:routeParams?",
	categories: ["social-media"],
	example: "/twitter/likes/DIYgod",
	parameters: {
		id: "username",
		routeParams: "extra parameters, see the table above"
	},
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
	name: "User likes",
	maintainers: ["xyqfer"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const { count, include_rts, only_media } = utils_default.parseRouteParams(ctx.req.param("routeParams"));
	const params = count ? { count } : {};
	await api_default.init();
	let data = await api_default.getUserLikes(id, params);
	if (!include_rts) data = utils_default.excludeRetweet(data);
	if (only_media) data = utils_default.keepOnlyMedia(data);
	return {
		title: `Twitter Likes - ${id}`,
		link: `https://x.com/${id}/likes`,
		item: utils_default.ProcessFeed(ctx, { data })
	};
}
//#endregion
export { route };
