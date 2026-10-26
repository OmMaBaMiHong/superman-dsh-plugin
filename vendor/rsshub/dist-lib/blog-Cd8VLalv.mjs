import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/gs/developer/blog.ts
const route = {
	path: "/developer/blog",
	categories: ["blog"],
	example: "/gs/developer/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["developer.gs.com/blog/posts"],
		target: "/developer/blog"
	}],
	name: "Goldman Sachs Developer Blog",
	zh: { name: "高盛开发者博客" },
	maintainers: ["chesha1"],
	handler: handlerRoute
};
async function handlerRoute() {
	const $ = load(await rofetch("https://developer.gs.com/blog/posts"));
	return {
		title: "Goldman Sachs Developer Blog",
		link: "https://developer.gs.com/blog/posts",
		item: $("div[data-cy=\"blog-card-grid\"] a").toArray().map((item) => {
			const link = "https://developer.gs.com" + $(item).attr("href");
			return {
				title: $(item).find("span").eq(1).text(),
				link,
				author: $(item).find("span").eq(2).text(),
				description: $(item).find("span").eq(3).text(),
				pubDate: $(item).find("span").eq(0).text()
			};
		})
	};
}
//#endregion
export { route };
