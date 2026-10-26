import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/usepanda/index.ts
const route = {
	path: "/feeds/:id",
	categories: ["other"],
	example: "/usepanda/feeds/5718e53e7a84fb1901e059cc",
	parameters: { id: "Feed ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Feeds",
	maintainers: ["lyrl"],
	handler,
	description: `| Channel | feedId                   |
| ------- | ------------------------ |
| Github  | 5718e53e7a84fb1901e059cc |`
};
async function handler(ctx) {
	const { data } = await got_default(`https://api-panda.com/v4/articles?feeds=${ctx.req.param("id")}&limit=${ctx.req.query("limit") ?? 30}&page=1&sort=popular`);
	return {
		title: "Panda Feeds",
		link: "https://usepanda.com/",
		item: data.map((item) => ({
			title: `${item.title} 🌟 ${item.source.likesCount}`,
			author: item.source.username,
			pubDate: parseDate(item.source.createdAt),
			link: item.source.targetUrl,
			description: item.description
		}))
	};
}
//#endregion
export { route };
