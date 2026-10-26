import "./types-DNj6Etbg.mjs";
import { n as api_default, t as utils_default } from "./utils-BZIs9uPz.mjs";
//#region lib/routes/twitter/keyword.ts
const route = {
	path: "/keyword/:keyword/:routeParams?",
	categories: ["social-media"],
	view: 1,
	example: "/twitter/keyword/RSSHub",
	parameters: {
		keyword: "keyword",
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
	name: "Keyword",
	maintainers: [
		"DIYgod",
		"yindaheng98",
		"Rongronggg9",
		"pseudoyu"
	],
	handler,
	radar: [{ source: ["x.com/search"] }]
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	await api_default.init();
	const data = await api_default.getSearch(keyword);
	return {
		title: `Twitter Keyword - ${keyword}`,
		link: `https://x.com/search?q=${encodeURIComponent(keyword)}`,
		item: utils_default.ProcessFeed(ctx, { data }),
		allowEmpty: true
	};
}
//#endregion
export { route };
