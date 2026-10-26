import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
//#region lib/routes/wechat/wechat2rss.ts
const route = {
	path: "/wechat2rss/:id",
	categories: ["new-media"],
	example: "/wechat/wechat2rss/5b925323244e9737c39285596c53e3a2f4a30774",
	parameters: { id: "公众号 id，打开 `https://wechat2rss.xlab.app/posts/list/`，在 URL 中找到 id；注意不是公众号页的 id，而是订阅的 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公众号（Wechat2RSS 来源）",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const feedUrl = `https://wechat2rss.xlab.app/feed/${ctx.req.param("id")}.xml`;
	const { title, link, description, image, items: item } = await parser.parseURL(feedUrl);
	const items = item.map((i) => ({
		title: i.title,
		pubDate: parseDate(i.isoDate),
		link: i.link,
		description: i["content:encoded"] || i.content
	}));
	return {
		title,
		link,
		description,
		image: image.url,
		item: items
	};
}
//#endregion
export { route };
