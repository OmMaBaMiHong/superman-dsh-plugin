import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/xbookcn/blog.ts
const route = {
	path: "/:label?",
	categories: ["reading"],
	example: "/xbookcn/精选作品",
	parameters: { label: "按名称分类，详见https://blog.xbookcn.net/p/all.html" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "短篇",
	maintainers: ["Lyunvy"],
	handler: async (ctx) => {
		const { label = "精选作品" } = ctx.req.param();
		const url = `https://blog.xbookcn.net/search/label/${label}`;
		const $ = load(await rofetch(url));
		const list = $(".blog-posts.hfeed .date-outer").find(".post").toArray().map((elem) => {
			const a = $(elem).find(".post-title a");
			return {
				title: a.text().trim(),
				link: a.attr("href"),
				category: []
			};
		});
		return {
			title: "xbookcn",
			link: url,
			item: await Promise.all(list.map(async (item) => await cache_default.tryGet(item.link, async () => {
				const $ = load(await rofetch(item.link));
				item.description = $(".post-body.entry-content").html() || "无内容";
				item.category = $(".post-labels a").toArray().map((el) => $(el).text().trim());
				return item;
			})))
		};
	}
};
//#endregion
export { route };
