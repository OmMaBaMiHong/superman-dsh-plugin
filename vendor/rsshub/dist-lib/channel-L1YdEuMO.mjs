import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/storm/channel.ts
const route = {
	path: "/channel/:id?",
	categories: ["new-media"],
	example: "/storm/channel/2",
	parameters: { id: "ID，可在 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["storm.mg/channel/:id"] }],
	name: "频道",
	maintainers: ["dzx-dzx"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "2";
	const rootUrl = "https://www.storm.mg";
	const currentUrl = new URL("/api/getArticleList", rootUrl).href;
	const list = (await rofetch(currentUrl, { query: { q: {
		condition: ["channel_id"],
		limit: [0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20],
		order: {
			col: "publish_at",
			sort: "DESC"
		},
		pagination: 1,
		remark: "文章列表",
		value: [[id]]
	} } })).list.map((item) => ({
		title: item.title,
		pubDate: parseDate(item.createdAt),
		author: item.articleAuthor,
		category: [...item.articleChannel.map((e) => e.channel.title), ...item.articleKeyword.map((e) => e.keyword.title)],
		updated: parseDate(item.updated),
		link: new URL(`/article/${item.oldId}`, rootUrl).href
	}));
	return {
		title: "風傳媒",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load(await rofetch(item.link));
			content(".notify_wordings").remove();
			content("#premium_block").remove();
			item.description = content("div[data-test-comp=\"ArticleContent\"]").html();
			return item;
		})))
	};
}
//#endregion
export { route };
