import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
//#region lib/routes/substack/subscribe.ts
const route = {
	path: "/subscribe/:user",
	categories: ["blog"],
	view: 1,
	example: "/substack/subscribe/mangoread",
	parameters: { user: "Username of the Substack" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Substack Subscription",
	maintainers: ["pseudoyu"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	if (!isValidHost(user)) throw new InvalidParameterError("Invalid user");
	const response = await rofetch(`https://${user}.substack.com/feed`);
	const feed = await parser.parseString(response);
	return {
		title: feed.title ?? "Substack",
		description: feed.description ?? `${user}'s Substack`,
		link: feed.link ?? `https://${user}.substack.com`,
		image: feed.image?.url ?? "",
		item: feed.items.map((item) => ({
			title: item.title ?? "Untitled",
			description: item["content:encoded"] ?? item.content ?? "",
			link: item.link ?? "",
			pubDate: item.pubDate ? parseDate(item.pubDate) : void 0,
			guid: item.guid ?? "",
			author: item.creator ?? user
		}))
	};
}
//#endregion
export { route };
