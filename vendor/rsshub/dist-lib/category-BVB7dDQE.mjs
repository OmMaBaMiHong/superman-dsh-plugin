import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-Cq59Vb-Z.mjs";
import { load } from "cheerio";
//#region lib/routes/baobua/category.ts
const route = {
	path: "/category/:category",
	categories: ["picture"],
	example: "/baobua/category/network",
	parameters: { category: "Category" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["baobua.com/cat/:category"],
		target: "/category/:category"
	}],
	name: "Category",
	maintainers: ["AiraNadih"],
	handler,
	url: "baobua.com/"
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const url = `${SUB_URL}cat/${category}/`;
	const $ = load((await got_default(url)).body);
	const itemRaw = $(".thcovering-video").toArray();
	return {
		title: `${SUB_NAME_PREFIX} - Category: ${category}`,
		link: url,
		item: await Promise.all(itemRaw.map((e) => {
			let link = $(e).find("a").attr("href");
			if (!link) return null;
			if (link.startsWith("/")) link = new URL(link, SUB_URL).href;
			return cache_default.tryGet(link, () => loadArticle(link));
		}).filter(Boolean))
	};
}
//#endregion
export { route };
