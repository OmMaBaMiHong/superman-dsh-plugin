import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/unraid/community-apps.ts
const appFeedUrl = "https://raw.githubusercontent.com/Squidly271/AppFeed/master/applicationFeed.json";
const defaultLimit = 20;
const route = {
	path: "/community-apps",
	categories: ["program-update"],
	example: "/unraid/community-apps",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["unraid.net/community/apps"] }],
	name: "Community Apps",
	maintainers: ["KTachibanaM"],
	handler,
	url: "unraid.net/community/apps"
};
async function handler(ctx) {
	const { data } = await got_default(appFeedUrl);
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : defaultLimit;
	let appList = data.applist;
	appList = appList.map((app) => {
		const _pubDate = app.LastUpdate ?? app.FirstSeen ?? 0;
		return {
			...app,
			_pubDate
		};
	});
	appList.sort((a, b) => b._pubDate - a._pubDate);
	return {
		title: "Unraid Community Apps",
		link: "https://unraid.net/community/apps",
		image: "https://craftassets.unraid.net/static/favicon/favicon.ico?v=1.0",
		item: appList.slice(0, limit).map((app) => ({
			title: `${app.Name} (${app.Repository ?? "Unknown repository"})`,
			link: app.Registry ?? `https://unraid.net/community/apps?q=${app.Name}`,
			description: app.Overview.replaceAll("\r\n", "<br>").replaceAll("\n", "<br>").replaceAll("[br]", "<br>"),
			pubDate: parseDate(app._pubDate * 1e3),
			category: app.CategoryList,
			upvotes: app.stars
		}))
	};
}
//#endregion
export { route };
