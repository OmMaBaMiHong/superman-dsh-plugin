import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-BxzXSacB.mjs";
import { load } from "cheerio";
//#region lib/routes/cosplaytele/category.ts
const route = {
	path: "/category/:category",
	categories: ["picture"],
	example: "/cosplaytele/category/cosplay",
	parameters: { category: "Category" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["cosplaytele.com/category/:category"],
		target: "/category/:category"
	}],
	name: "Category",
	maintainers: ["AiraNadih"],
	handler,
	url: "cosplaytele.com/"
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit")) || 20;
	const category = ctx.req.param("category");
	const categoryUrl = `${SUB_URL}category/${category}/`;
	const $ = load((await got_default(categoryUrl)).body);
	const itemRaw = $("#content .post-item").slice(0, limit).toArray();
	return {
		title: `${SUB_NAME_PREFIX} - Category: ${category}`,
		link: categoryUrl,
		item: await Promise.all(itemRaw.map((e) => {
			const link = $(e).find("h5.post-title a").attr("href");
			return cache_default.tryGet(link, () => loadArticle(link));
		}))
	};
}
//#endregion
export { route };
