import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as renderDescription, t as defaultDomain } from "./utils-CM2dWw66.mjs";
//#region lib/routes/pornhub/category.ts
const route = {
	path: "/category/:caty/:img?",
	categories: ["multimedia"],
	view: 3,
	example: "/pornhub/category/popular-with-women",
	parameters: {
		caty: "category, see [categories](https://www.pornhub.com/webmasters/categories)",
		img: "show images, set to `img=1` to enable"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Category",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const { caty: category, img } = ctx.req.param();
	const categories = await cache_default.tryGet("pornhub:categories", async () => {
		const { data } = await got_default(`${defaultDomain}/webmasters/categories`);
		return data.categories;
	});
	const categoryId = Number.isNaN(category) ? categories.find((item) => item.category === category)?.id : category;
	const categoryName = Number.isNaN(category) ? category : categories.find((item) => item.id === Number.parseInt(category)).category;
	const response = await cache_default.tryGet(`pornhub:category:${categoryName}`, async () => {
		const { data } = await got_default(`${defaultDomain}/webmasters/search?category=${categoryName}`);
		return data;
	}, config.cache.routeExpire, false);
	if (response.code) throw new Error(response.message);
	const showImages = img === "img=1";
	const list = response.videos.map((item) => ({
		title: item.title,
		link: item.url,
		description: renderDescription({ thumbs: item.thumbs }, showImages),
		pubDate: parseDate(item.publish_date),
		category: [.../* @__PURE__ */ new Set([...item.tags.map((t) => t.tag_name), ...item.categories.map((c) => c.category)])]
	}));
	return {
		title: `Pornhub - ${categoryName}`,
		link: `${defaultDomain}/video?c=${categoryId}`,
		item: list
	};
}
//#endregion
export { route };
