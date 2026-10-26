import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/iguoguo/index.ts
const rootUrl = "https://www.iguoguo.net";
const getCategoryIdFromSlug = (slug) => cache_default.tryGet(`iguoguo:category:${slug}`, async () => {
	return (await rofetch(`${rootUrl}/wp-json/wp/v2/categories`, { query: { slug } }))[0].id;
});
const getPostsByCategory = (categoryId, limit) => cache_default.tryGet(`iguoguo:posts:${categoryId}`, async () => {
	return await rofetch(`${rootUrl}/wp-json/wp/v2/posts`, { query: {
		categories: categoryId,
		per_page: limit
	} });
}, config.cache.routeExpire, false);
const route = {
	path: "/html5",
	categories: ["design"],
	example: "/iguoguo/html5",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新 H5",
	maintainers: ["yuxinliu-alex"],
	handler
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit") ?? "10");
	const currentUrl = `${rootUrl}/html5`;
	const categoryId = await getCategoryIdFromSlug("h5");
	const posts = await getPostsByCategory(categoryId, limit);
	const mime = {
		jpg: "jpeg",
		png: "png"
	};
	return {
		title: "爱果果",
		link: currentUrl,
		description: "爱果果iguoguo是一个优秀酷站、h5、UI素材资源的发布分享平台，是设计师的灵感聚合地和素材下载源。",
		language: "zh-cn",
		item: posts.map((item) => {
			const $ = load(item.content.rendered);
			const cover = $("p > img").first().attr("src");
			$("p > img").first().remove();
			$("h4").each((_, el) => {
				if ($(el).text().includes("扫码欣赏")) $(el).remove();
			});
			return {
				title: item.title.rendered,
				description: $.html(),
				link: item.link,
				cover,
				pubDate: parseDate(item.date_gmt),
				media: cover && { content: {
					url: cover,
					type: `image/${mime[cover.split(".").pop()]}`
				} }
			};
		})
	};
}
//#endregion
export { route };
