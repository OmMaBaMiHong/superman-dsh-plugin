import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import sanitizeHtml from "sanitize-html";
import Parser from "rss-parser";
//#region lib/routes/github/activity.ts
const parser = new Parser();
const route = {
	path: "/activity/:user",
	name: "User Activities",
	maintainers: ["hyoban"],
	example: "/github/activity/DIYgod",
	categories: ["programming"],
	view: 5,
	parameters: { user: "GitHub username" },
	description: "Get the activities of a user on GitHub, based on the GitHub official RSS feed",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["github.com/:user"],
		target: "/activity/:user"
	}],
	handler: async (ctx) => {
		const { user } = ctx.req.param();
		const raw = await (await rofetch(`https://github.com/${user}.atom`)).text();
		const image = raw.match(/<media:thumbnail height="30" width="30" url="(.+?)"/)?.[1];
		const feed = await parser.parseString(raw);
		return {
			title: `${user}'s GitHub activities`,
			link: feed.link,
			image,
			item: feed.items.map((item) => ({
				title: item.title ?? "",
				link: item.link,
				description: sanitizeHtml(item.content?.replaceAll(/href="\/(.+?)"/g, "href=\"https://github.com/$1\"") ?? "", { allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"] }),
				pubDate: item.pubDate ? parseDate(item.pubDate) : void 0,
				author: item.author,
				guid: item.id,
				image
			})),
			allowEmpty: true
		};
	}
};
//#endregion
export { route };
