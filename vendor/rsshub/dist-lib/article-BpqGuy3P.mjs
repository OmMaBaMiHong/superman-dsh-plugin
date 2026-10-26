import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/elecfans/article.ts
const route = {
	path: "/article/:atype",
	categories: ["programming"],
	example: "/elecfans/article/special",
	parameters: { atype: "需获取文章的类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章",
	radar: [{ source: ["www.elecfans.com"] }],
	maintainers: ["tian051011"],
	handler: async (ctx) => {
		const { atype } = ctx.req.param();
		const $ = load(await rofetch(`https://www.elecfans.com/article/${atype}/`));
		const list = $("#mainContent li").toArray().map((item) => {
			item = $(item);
			const a = item.find("a").eq(1);
			return {
				title: a.text(),
				link: String(a.attr("href"))
			};
		});
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			item.pubDate = parseDate($(".article-info .time").first().text());
			item.author = $(".article-info a").first().text();
			item.description = $(".rticle-content .simditor-body").first().html();
			item.category = $(".hot-main li > span").toArray().map((item) => $(item).text().trim());
			return item;
		})));
		return {
			title: `elecfans ${atype} articles`,
			link: `https://www.elecfans.com/article/${atype}/`,
			item: items
		};
	}
};
//#endregion
export { route };
