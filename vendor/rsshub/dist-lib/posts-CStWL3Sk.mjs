import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { t as getConfig } from "./utils-BYk8-Fk-.mjs";
//#region lib/routes/discourse/posts.ts
const route = {
	path: "/:configId/posts",
	categories: ["bbs"],
	example: "/discourse/0/posts",
	parameters: { configId: "Environment variable configuration id, see above" },
	features: {
		requireConfig: [{
			name: "DISCOURSE_CONFIG_*",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Latest posts",
	maintainers: ["dzx-dzx"],
	handler
};
async function handler(ctx) {
	const { link, key } = getConfig(ctx);
	const feed = await parser.parseString((await got_default(`${link}/posts.rss`, { headers: { "User-Api-Key": key } })).data);
	feed.items = feed.items.map((e) => ({
		description: e.content,
		author: e.creator,
		...e
	}));
	return {
		item: feed.items,
		...feed
	};
}
//#endregion
export { route };
