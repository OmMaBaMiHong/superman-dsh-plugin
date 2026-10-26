import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
//#region lib/routes/medium/feed.ts
const route = {
	path: "/feed/:user",
	categories: ["blog"],
	view: 1,
	example: "/medium/feed/zhgchgli",
	parameters: { user: "Username of the Medium" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["medium.com/@:user"],
		target: "/feed/:user"
	}],
	name: "Medium Feed",
	maintainers: ["pseudoyu"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	if (!user) throw new InvalidParameterError("Invalid user");
	const feed = await parser.parseURL(`https://medium.com/feed/@${user}`);
	return {
		title: feed.title ?? "Medium",
		description: feed.description ?? `${user}'s Medium`,
		link: feed.link ?? `https://medium.com/@${user}`,
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
