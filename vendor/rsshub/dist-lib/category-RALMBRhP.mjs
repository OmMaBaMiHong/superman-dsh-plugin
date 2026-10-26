import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-CyahSu9m.mjs";
//#region lib/routes/4khd/category.ts
const route = {
	path: "/category/:category",
	categories: ["picture"],
	example: "/4khd/category/cosplay",
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
		source: ["www.4khd.com/pages/:category"],
		target: "/category/:category"
	}],
	name: "Category",
	maintainers: ["AiraNadih"],
	handler,
	url: "www.4khd.com/"
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit")) || 20;
	const category = ctx.req.param("category");
	const categoryUrl = `${SUB_URL}pages/${category}/`;
	const { data } = await got_default(`${SUB_URL}wp-json/wp/v2/categories?slug=${category === "album" ? "photo" : category}`);
	const categoryId = data[0].id;
	const { data: posts } = await got_default(`${SUB_URL}wp-json/wp/v2/posts?categories=${categoryId}&per_page=${limit}`);
	return {
		title: `${SUB_NAME_PREFIX} - Category: ${category}`,
		link: categoryUrl,
		item: posts.map((post) => loadArticle(post))
	};
}
//#endregion
export { route };
