import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { a as rootUrl, i as parseThumbnail, o as typeMap, t as apiRootUrl } from "./utils-CKGISivV2.mjs";
//#region lib/routes/iwara/ranking.ts
const sortMap = {
	date: "Latest",
	trending: "Trending",
	popularity: "Popularity",
	views: "Views",
	likes: "Likes"
};
const ratingMap = {
	all: "All",
	general: "General",
	ecchi: "Ecchi"
};
const route = {
	path: "/ranking/:type?/:sort?/:rating?",
	example: "/iwara/ranking/video/date/ecchi",
	parameters: {
		type: "Content type, can be video or image, default is video",
		sort: "Sort type, can be date, trending, popularity, views, likes, default is date",
		rating: "Rating, can be all, general, ecchi, default is ecchi"
	},
	name: "Ranking",
	maintainers: ["CaoMeiYouRen233"],
	handler,
	features: {
		requirePuppeteer: true,
		nsfw: true
	},
	radar: [{
		source: ["www.iwara.tv/videos", "www.iwara.tv/images"],
		target: (params, url) => {
			const searchParams = new URL(url).searchParams;
			return `/iwara/ranking/${url.includes("/videos") ? "video" : "image"}/${searchParams.get("sort") || "date"}/${searchParams.get("rating") || "ecchi"}`;
		}
	}]
};
async function handler(ctx) {
	const { type = "video", sort = "date", rating = "ecchi" } = ctx.req.param();
	const limit = ctx.req.query("limit") || 32;
	const url = `${apiRootUrl}/${type === "video" ? "videos" : "images"}?sort=${sort}&rating=${rating}&limit=${limit}`;
	const items = await cache_default.tryGet(`iwara:ranking:${type}:${sort}:${rating}`, async () => {
		const { page, destroy } = await getPlaywrightPage(url, {
			onBeforeLoad: async (page) => {
				await page.route("**/*", (route) => {
					const request = route.request();
					request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "xhr" || request.resourceType() === "fetch" ? route.continue() : route.abort();
				});
			},
			gotoConfig: { waitUntil: "networkidle" }
		});
		try {
			const content = await page.evaluate(() => document.querySelector("pre")?.textContent || document.body.textContent);
			return JSON.parse(content || "{}").results.map((item) => ({
				title: item.title,
				author: item.user.name,
				link: `${rootUrl}/${type === "video" ? "video" : "image"}/${item.id}${item.slug ? `/${item.slug}` : ""}`,
				category: item.tags?.map((i) => i.id) || [],
				description: parseThumbnail(type, item),
				pubDate: parseDate(item.createdAt)
			}));
		} finally {
			await destroy();
		}
	}, config.cache.routeExpire, false);
	return {
		title: `Iwara Ranking - ${typeMap[type]} - ${sortMap[sort]} - ${ratingMap[rating]}`,
		link: `${rootUrl}/${type === "video" ? "videos" : "images"}?sort=${sort}&rating=${rating}`,
		item: items
	};
}
//#endregion
export { route };
