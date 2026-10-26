import { n as api_default, t as utils_default } from "./utils-BZIs9uPz.mjs";
//#region lib/routes/twitter/list.ts
const route = {
	path: "/list/:id/:routeParams?",
	categories: ["social-media"],
	example: "/twitter/list/1502570462752219136",
	parameters: {
		id: "list id, get from url",
		routeParams: "extra parameters, see the table above"
	},
	features: {
		requireConfig: [{
			name: "TWITTER_AUTH_TOKEN",
			description: "Please see above for details."
		}, {
			name: "TWITTER_THIRD_PARTY_API",
			description: "Please see above for details."
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "List timeline",
	maintainers: [
		"DIYgod",
		"xyqfer",
		"pseudoyu"
	],
	handler,
	radar: [{
		source: ["x.com/i/lists/:id"],
		target: "/list/:id"
	}]
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const { count, include_rts, only_media } = utils_default.parseRouteParams(ctx.req.param("routeParams"));
	const params = count ? { count } : {};
	await api_default.init();
	let data = await api_default.getList(id, params);
	if (!include_rts) data = utils_default.excludeRetweet(data);
	if (only_media) data = utils_default.keepOnlyMedia(data);
	return {
		title: `Twitter List - ${id}`,
		link: `https://x.com/i/lists/${id}`,
		item: utils_default.ProcessFeed(ctx, { data })
	};
}
//#endregion
export { route };
