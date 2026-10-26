import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as ProcessForm, t as ProcessFeed } from "./utils-DfVWtVzE.mjs";
//#region lib/routes/lfsyd/home.ts
const route = {
	path: "/home",
	categories: ["game"],
	example: "/lfsyd/home",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.iyingdi.com/"] }],
	name: "首页",
	maintainers: ["auto-bot-ty"],
	handler,
	url: "www.iyingdi.com/"
};
async function handler() {
	const rootUrl = "https://www.iyingdi.com";
	const { posts } = (await got_default({
		method: "post",
		url: "https://api.iyingdi.com/mweb/feed/recommend-content-list",
		headers: {
			"App-Udid": "unknown",
			Host: "api.iyingdi.com",
			"Login-Token": "nologin",
			Origin: "https://mob.iyingdi.com",
			Platform: "mweb",
			Preid: "86f2007de00272e24a54831a621aecc5",
			Referer: "https://mob.iyingdi.com/"
		},
		form: ProcessForm({
			size: 30,
			timestamp: ""
		}, "mweb")
	})).data;
	return {
		title: "首页 - 旅法师营地",
		link: rootUrl,
		item: await ProcessFeed(cache_default, posts.map((item) => ({
			title: item.post.title,
			pubDate: parseDate(item.post.show_time * 1e3),
			link: `${rootUrl}/tz/post/${item.post.id}`,
			guid: item.post.title,
			postId: item.post.id
		})))
	};
}
//#endregion
export { route };
